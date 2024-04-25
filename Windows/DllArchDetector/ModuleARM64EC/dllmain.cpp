// dllmain.cpp : Defines the entry point for the DLL application.
#include "pch.h"

BOOL APIENTRY DllMain( HMODULE hModule,
                       DWORD  ul_reason_for_call,
                       LPVOID lpReserved
                     )
{
    int x = 1;
    int y = 2;
    int z = 0;
    switch (ul_reason_for_call)
    {
    case DLL_PROCESS_ATTACH:
        z = x + y;
        break;
    case DLL_THREAD_ATTACH:
    case DLL_THREAD_DETACH:
    case DLL_PROCESS_DETACH:
        break;
    }
    return TRUE;
}

const char* MessageARM64EC() noexcept
{
	return "This is ARM64";
}
