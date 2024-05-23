#include "../ModuleARM64/ModuleARM64.h"
#include "../ModuleARM64EC/ModuleARM64EC.h"
#include "../ModuleARM64X/ModuleARM64X.h"
#include "../ModuleX64/ModuleX64.h"

// Windows API
#include <DbgHelp.h>
//#include <ImageHlp.h>
#include <libloaderapi.h>

#include <cstddef>
#include <cstdio>
#include <string>

// See https://ntdoc.m417z.com/
#ifndef IMAGE_FILE_MACHINE_ARM64EC
#define IMAGE_FILE_MACHINE_ARM64EC           0xA641
#endif

#ifndef IMAGE_FILE_MACHINE_ARM64X
#define IMAGE_FILE_MACHINE_ARM64X            0xA64E
#endif

struct RtlGetImageFileMachinesOutput
{
    ULONG X86 : 1;
    ULONG X64 : 1;
    ULONG ARM : 1;
    ULONG ARM64 : 1;
    ULONG ARM64EC : 1;
};

//typedef NTSTATUS (* PGIFM)(PCWSTR, RtlGetImageFileMachinesOutput*);

// From DbgHelp.h
#if 0
PIMAGE_NT_HEADERS IMAGEAPI ImageNtHeader(
    _In_ PVOID Base
);
#endif // 0

bool DumpForArch(WORD arch)
{
    const char* moduleName;
    switch (arch)
    {
        case IMAGE_FILE_MACHINE_AMD64:
            moduleName = ModuleNameX64();
            break;
        case IMAGE_FILE_MACHINE_ARM64:
            moduleName = "ModuleARM64.dll";
            break;
        case IMAGE_FILE_MACHINE_ARM64EC:
            //moduleName = ModuleNameARM64EC();
            moduleName = "ModuleARM64EC.dll";
            break;
        case IMAGE_FILE_MACHINE_ARM64X:
            moduleName = "ModuleARM64X.dll";
            break;

        default:
            printf("[FAIL] Unknown arch: [0x%X]\n\n", arch);
            return false;
    }

#if 0
#pragma region ImageLoad

    auto loaded = ImageLoad(moduleName, nullptr);
    if (!loaded)
    {
        printf("[FAIL] Module [%s] not loaded!\n\n", moduleName);
        return false;
    }
    else
    {
        printf("For module [%s]\n", moduleName);
    }

    printf("From ImageLoad:\n");
    auto mach = loaded->FileHeader->FileHeader.Machine;
    printf("%20s: [0x%X]\n", "Machine", mach);

    // Look for "special" sections
    bool hasA64Xrm { false };
    for (size_t i = 0; i < loaded->NumberOfSections; i++)
    {
        auto name = reinterpret_cast<const char*>(loaded->Sections[i].Name);
        if (std::string(name) == ".a64xrm")
        {
            hasA64Xrm = true;
        }
    }

    printf("%20s: [%s]\n", "Has .a64xrm section", hasA64Xrm ? "TRUE" : "FALSE");
    printf("\n");

#pragma endregion ImageLoad

#pragma region RtlGetImageFileMachines

    auto ntdllModule = LoadLibrary(L"NTDLL");
    if (!ntdllModule)
    {
        printf("[FAIL] could not load NTDLL\n");
        return false;
    }
    auto getImageFileMachines = (PGIFM) GetProcAddress(ntdllModule, "RtlGetImageFileMachines");

    RtlGetImageFileMachinesOutput fileMachs { 0 };
    auto modulePathLength = static_cast<int>(strlen(loaded->ModuleName));
    std::wstring modulePath {};
    modulePath.resize(modulePathLength);
    auto convertSize = MultiByteToWideChar(
        CP_UTF8,
        /*dwFlags*/0,
        loaded->ModuleName,
        modulePathLength,
        (LPWSTR) modulePath.c_str(),
        modulePathLength);

    auto unloaded = ImageUnload(loaded);
    if (!unloaded)
    {
        printf("[WARN] Failed to unload %s\n", moduleName);
    }

    // Crashes on ARM64 when invoked from file share
    auto gifmStatus = getImageFileMachines(modulePath.c_str(), &fileMachs);

    printf("From RtlGetImageFileMachines:\n");
    printf("%20s: [%d]\n", "Contains x86", fileMachs.X86);
    printf("%20s: [%d]\n", "Contains x64", fileMachs.X64);
    printf("%20s: [%d]\n", "Contains ARM", fileMachs.ARM);
    printf("%20s: [%d]\n", "Contains ARM64", fileMachs.ARM64);
    printf("%20s: [%d]\n", "Contains ARM64EC", fileMachs.ARM64EC);
    printf("\n");

#pragma endregion RtlGetImageFileMachines
#endif // 0

    auto moduleHandle =  GetModuleHandleA(moduleName);
    if (moduleHandle == nullptr)
    {
        printf("[FAIL] Could not load handle for [%s].\n\n", moduleName);
        return false;
    }
    bool hasA64Xrm { false };

#pragma region ImageNtHeader

#if 0
    auto ntHeaders = ImageNtHeader(moduleHandle);
    auto mach = ntHeaders->FileHeader.Machine;
    printf("%20s: [0x%X]\n", "Machine", mach);

    auto currentSection = IMAGE_FIRST_SECTION(ntHeaders);
    for (auto i = 0; i < ntHeaders->FileHeader.NumberOfSections; i++, currentSection++)
    {
        auto name = reinterpret_cast<const char*>(currentSection->Name);
        if (std::string(name) == ".a64xrm")
        {
            hasA64Xrm = true;
            break;
        }
    }

    printf("%20s: [%s]\n", "Has .a64xrm section", hasA64Xrm ? "TRUE" : "FALSE");
    printf("\n");
#endif // 0

#pragma endregion ImageNtHeader

/*
 * Manually calculating the properties and header section names using what's already in memory.
 * Do this when DbgHelp or ImageHlp DLLs can't be used.
 */
#pragma region Manual Scanning

    auto base = reinterpret_cast<std::byte*>(moduleHandle);
    auto dosHeader = reinterpret_cast<IMAGE_DOS_HEADER*>(moduleHandle);
    auto signature = reinterpret_cast<char*>(base + dosHeader->e_lfanew); // "PE\0\0"
    auto fileHeader = reinterpret_cast<IMAGE_FILE_HEADER*>(signature + 4);
    if (fileHeader->SizeOfOptionalHeader < sizeof(IMAGE_OPTIONAL_HEADER))
    {
        // No optional header => not an ARM64EC image
        return true;
    }
    auto optionalHeader = reinterpret_cast<IMAGE_OPTIONAL_HEADER*>(
        reinterpret_cast<std::byte*>(fileHeader) + sizeof(*fileHeader)
    );
    if (optionalHeader->NumberOfRvaAndSizes < 11)
    {
        // Ensure IMAGE_DIRECTORY_ENTRY_LOAD_CONFIG is available
        return true;
    }
    auto dataDirectory = optionalHeader->DataDirectory[IMAGE_DIRECTORY_ENTRY_LOAD_CONFIG];
    if (dataDirectory.Size < sizeof(IMAGE_LOAD_CONFIG_DIRECTORY))
    {
        return true;
    }
    auto loadConfigDirectory = reinterpret_cast<IMAGE_LOAD_CONFIG_DIRECTORY*>(base + dataDirectory.VirtualAddress);
    bool hasChpeMetadata = loadConfigDirectory->CHPEMetadataPointer != 0;

    auto ntHeaders2 = reinterpret_cast<PIMAGE_NT_HEADERS>(base + dosHeader->e_lfanew);
    auto currentSection2 = IMAGE_FIRST_SECTION(ntHeaders2);
    hasA64Xrm = false;
    for (auto i = 0; i < ntHeaders2->FileHeader.NumberOfSections; i++, currentSection2++)
    {
        auto name = reinterpret_cast<const char*>(currentSection2->Name);
        if (std::string(name) == ".a64xrm")
        {
            hasA64Xrm = true;
            break;
        }
    }

    printf("%20s: [%s]\n", "Has CHPE metadata", hasChpeMetadata ? "TRUE" : "FALSE");
    printf("%20s: [%s]\n", "Has .a64xrm section", hasA64Xrm ? "TRUE" : "FALSE");
    printf("\n");

#pragma endregion Manual Scanning

    return true;
}

int main()
{
// https://techcommunity.microsoft.com/t5/windows-os-platform-blog/getting-to-know-arm64ec-defines-and-intrinsic-functions/ba-p/2957235
#ifdef _M_ARM64
    DumpForArch(IMAGE_FILE_MACHINE_ARM64);
#endif // _M_ARM64

#ifdef _M_ARM64EC
    // Implies _M_X64
#endif // _M_ARM64EC

#ifdef _M_X64
    DumpForArch(IMAGE_FILE_MACHINE_AMD64);
    //DumpForArch(IMAGE_FILE_MACHINE_ARM64EC);
#endif // _M_X64

DumpForArch(IMAGE_FILE_MACHINE_ARM64X);

    return EXIT_SUCCESS;
}
