// dllmain.cpp : Defines the entry point for the DLL application.
#include "pch.h"

BOOL APIENTRY DllMain( HMODULE hModule,
                       DWORD  ul_reason_for_call,
                       LPVOID lpReserved
                     )
{
    int x = 1;
    int y = 2;
    int z;
    switch (ul_reason_for_call)
    {
    case DLL_PROCESS_ATTACH:
        z = 0;
        break;
    case DLL_THREAD_ATTACH:
		z = 1;
		break;
    case DLL_THREAD_DETACH:
		z = 2;
		break;
    case DLL_PROCESS_DETACH:
		z = 3;
        break;
    }
    return TRUE;
}

const char* MessageARM64EC() noexcept
{
	return "This is ARM64";
}
