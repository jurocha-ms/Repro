#include "../ModuleARM64EC/ModuleARM64EC.h"
#include "../ModuleX64/ModuleX64.h"

#include <cstdio>

int main()
{
// https://techcommunity.microsoft.com/t5/windows-os-platform-blog/getting-to-know-arm64ec-defines-and-intrinsic-functions/ba-p/2957235
#ifdef _M_X64
	auto messageIntel = MessageX64();
	printf("[%s]", messageIntel);
#endif // _M_X64

#ifdef _M_ARM64EC
	auto messageArm = MessageARM64EC();
	printf("[%s]", messageArm);
#endif // _M_ARM64EC
}
