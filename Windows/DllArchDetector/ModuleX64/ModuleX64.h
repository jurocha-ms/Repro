#pragma once

#define WIN32_LEAN_AND_MEAN             // Exclude rarely-used stuff from Windows headers
// Windows Header Files
#include <windows.h>

char const* __cdecl MessageX64(void) noexcept;

char const* __cdecl ModuleNameX64(void) noexcept;
