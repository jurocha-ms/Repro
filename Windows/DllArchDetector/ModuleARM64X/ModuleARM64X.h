#pragma once

#define WIN32_LEAN_AND_MEAN             // Exclude rarely-used stuff from Windows headers
// Windows Header Files
#include <windows.h>

const char* MessageARM64X() noexcept;

char const* __cdecl ModuleNameARM64X(void) noexcept;
