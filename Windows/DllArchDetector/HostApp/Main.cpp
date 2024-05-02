#include "../ModuleARM64EC/ModuleARM64EC.h"
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
    union
    {
        ULONG Value;

        struct
        {
            ULONG X86 : 1;
            ULONG X64 : 1;
            ULONG ARM : 1;
            ULONG ARM64 : 1;
            ULONG ARM64EC : 1;
        };
    };
};

typedef NTSTATUS (* PGIFM)(PCWSTR, RtlGetImageFileMachinesOutput*);

bool DumpForArch(WORD arch)
{
    const char* message;
    const char* moduleName;
    switch (arch)
    {
        case IMAGE_FILE_MACHINE_AMD64:
            moduleName = "ModuleX64.dll";
            message = MessageX64();
            break;
        case IMAGE_FILE_MACHINE_ARM64EC:
            moduleName = "ModuleARM64EC.dll";
            message = MessageARM64EC();
            break;
        default:
            printf("[FAIL] Unknown arch: [%X]\n", arch);
            return false;
    }

    printf("[DLL]: [%s]\n", message);

    auto loaded = ImageLoad(moduleName, nullptr);
    if (!loaded)
    {
        printf("[FAIL] Module [%s] not loaded!\n", moduleName);
        return false;
    }

    auto mach = loaded->FileHeader->FileHeader.Machine;
    printf("Machine for [%s]: [%X]\n", moduleName, mach);

    auto unloaded = ImageUnload(loaded);
    if (!unloaded)
    {
        printf("[WARN] Failed to unload %s\n", moduleName);
    }

    auto ntdllModule = LoadLibrary(L"NTDLL");
    if (!ntdllModule)
    {
        //TODO: Error message
        return 1;
    }
    auto getImageFileMachines = (PGIFM)GetProcAddress(ntdllModule, "RtlGetImageFileMachines");

    RtlGetImageFileMachinesOutput fileMachs { 0 };
    auto modulePathLength = strlen(loaded->ModuleName);
    std::wstring modulePath {};
    modulePath.resize(modulePathLength);
    auto convertSize = MultiByteToWideChar(
        CP_UTF8,
        /*dwFlags*/0,
        loaded->ModuleName,
        modulePathLength,
        (LPWSTR)modulePath.c_str(),
        modulePathLength);

    auto gifmStatus = getImageFileMachines(modulePath.c_str(), &fileMachs);
    auto isArm64Ec = fileMachs.ARM64EC;
    auto isArm64 = fileMachs.ARM64;
    auto isArm = fileMachs.ARM;
    auto isX64 = fileMachs.X64;
    auto isX86 = fileMachs.X86;
    auto value = fileMachs.Value;
    //TODO: Format and print.

    return true;
}

int main()
{
// https://techcommunity.microsoft.com/t5/windows-os-platform-blog/getting-to-know-arm64ec-defines-and-intrinsic-functions/ba-p/2957235
#ifdef _M_X64
    DumpForArch(IMAGE_FILE_MACHINE_AMD64);
#endif // _M_X64

#ifdef _M_ARM64EC
    DumpForArch(IMAGE_FILE_MACHINE_ARM64EC);
#endif // _M_ARM64EC
}
