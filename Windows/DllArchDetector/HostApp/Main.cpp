#include "../ModuleARM64EC/ModuleARM64EC.h"
#include "../ModuleX64/ModuleX64.h"

#include <ImageHlp.h>

#include <cstdio>

// See https://ntdoc.m417z.com/
#ifndef IMAGE_FILE_MACHINE_ARM64EC
#define IMAGE_FILE_MACHINE_ARM64EC           0xA641
#endif

#ifndef IMAGE_FILE_MACHINE_ARM64X
#define IMAGE_FILE_MACHINE_ARM64X            0xA64E
#endif

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
