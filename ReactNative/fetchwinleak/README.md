# `Memory leak with continuous Blob usage:`

This sample showcases the memory leak fixed for iOS, macOS [#24745](https://github.com/facebook/react-native/pull/24745), on Windows.

React Native does not trigger any clean-up mechanism when a JabaScritp `Blob` instance goes out of scope and is garbage-collected.
The associated blob data on the native side stays in memory, leading to memory leaks as subsiquent Blob objects are created/disposed.

This sample app provides the following:
- A React Native Windows app that makes `fetch` requests to an HTTP endpoint for an arbitrary number of bytes.
- A .NET HTTP listener (server) that responds to GET requests with a string of size given by the request URL path:
  ```
  http://localhost:5000/{response_content_length}
  ```
- A React Native macOS projection of the app for control/reference.

## Environment

- `react-native-windows` version `0.72.15` and earlier

## Instructions

1. Start the client and server
    ```pwsh
    yarn
    npx react-native start-windows

    cd windows\HttpList
    dotnet run
    ```
1. Continuously click on `Reload`.\
  Use a process monitoring tool to observe the significant increase in memory usage by the application which never goes down.

Note, the macOS variant of this app does not show memory usage issues.
