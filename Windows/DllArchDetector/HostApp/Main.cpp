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
    switch (arch)
    {
        case IMAGE_FILE_MACHINE_AMD64:
            return true;
        case IMAGE_FILE_MACHINE_ARM64EC:
            return true;
        default:
            return false;
    }
}

int main()
{
// https://techcommunity.microsoft.com/t5/windows-os-platform-blog/getting-to-know-arm64ec-defines-and-intrinsic-functions/ba-p/2957235
#ifdef _M_X64
	auto messageIntel = MessageX64();
	printf("[%s]\n", messageIntel);
#endif // _M_X64

#ifdef _M_ARM64EC
	auto messageArm = MessageARM64EC();
	printf("[%s]\n", messageArm);
#endif // _M_ARM64EC

    auto loaded = ImageLoad("ModuleX64.dll", nullptr);
    if (!loaded)
    {
        printf("[FAAAAAAIL] ModuleX64 not loaded!");
        return 1;
    }

    auto arch = loaded->FileHeader->FileHeader.Machine;
    printf("Machine for ModuleX64: [%u]", arch);

    auto unloaded = ImageUnload(loaded);
    if (!unloaded)
    {
        printf("[WARN] Failed to unload ModuleX64");
    }
}
