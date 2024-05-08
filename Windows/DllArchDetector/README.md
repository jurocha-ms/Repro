# DLL Machine Architecture Detector

Simple Windows console executable meant to distinguish diferrent types of ARM64-compatible DLLs already loaded by the process.

The purpose is to obtain the same relevant information that could be obtained by runing `DUMPBIN.EXE /HEADERS` from withing the same process.
```cmd
Dump of file ModuleX64.dll
PE signature found
File Type: DLL
FILE HEADER VALUES
            8664 machine (x64)

Dump of file ModuleARM64EC.dll
PE signature found
File Type: DLL
FILE HEADER VALUES
            8664 machine (x64) (ARM64X)
```


## References
- https://ffri.github.io/ProjectChameleon
- https://learn.microsoft.com/en-us/windows/win32/debug/pe-format
- https://learn.microsoft.com/en-us/windows/arm/arm64ec
- https://learn.microsoft.com/en-us/windows/win32/api/imagehlp/nf-imagehlp-imageload
