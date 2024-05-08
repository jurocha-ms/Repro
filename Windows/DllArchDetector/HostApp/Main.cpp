#include "../ModuleARM64/ModuleARM64.h"
#include "../ModuleARM64EC/ModuleARM64EC.h"
#include "../ModuleARM64X/ModuleARM64X.h"
#include "../ModuleX64/ModuleX64.h"

#include <ImageHlp.h>

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

typedef NTSTATUS (* PGIFM)(PCWSTR, RtlGetImageFileMachinesOutput*);

bool DumpForArch(WORD arch)
{
    const char* moduleName;
    switch (arch)
    {
        case IMAGE_FILE_MACHINE_AMD64:
            moduleName = "ModuleX64.dll";
            break;
        case IMAGE_FILE_MACHINE_ARM64:
            moduleName = "ModuleARM64.dll";
            break;
        case IMAGE_FILE_MACHINE_ARM64EC:
            moduleName = "ModuleARM64EC.dll";
            break;
        case IMAGE_FILE_MACHINE_ARM64X:
            moduleName = "ModuleARM64X.dll";
            break;

        default:
            printf("[FAIL] Unknown arch: [0x%X]\n\n", arch);
            return false;
    }

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

    auto ntdllModule = LoadLibrary(L"NTDLL");
    if (!ntdllModule)
    {
        printf("[FAIL] could not load NTDLL\n");
        return false;
    }
    auto getImageFileMachines = (PGIFM)GetProcAddress(ntdllModule, "RtlGetImageFileMachines");

    RtlGetImageFileMachinesOutput fileMachs { 0 };
    auto modulePathLength = static_cast<int>(strlen(loaded->ModuleName));
    std::wstring modulePath {};
    modulePath.resize(modulePathLength);
    auto convertSize = MultiByteToWideChar(
        CP_UTF8,
        /*dwFlags*/0,
        loaded->ModuleName,
        modulePathLength,
        (LPWSTR)modulePath.c_str(),
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
    DumpForArch(IMAGE_FILE_MACHINE_ARM64EC);
#endif // _M_X64

DumpForArch(IMAGE_FILE_MACHINE_ARM64X);

    return EXIT_SUCCESS;
}
