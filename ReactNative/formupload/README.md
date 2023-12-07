# `Windows: Wrongly casted multipart/form data`

This sample reproduces React Native Windows bug [#12392](https://github.com/microsoft/react-native-windows/issues/12392).

React Native Windows uses the same spec as iOS/macOS for its HTTP module.\
This changed the format of the form data collection requests.\
Previously, it was structured as a `JSObject`. Now it's a `JSArray`, which causes form data requests to silently fail with the following symptom:

Yellow Box warning: `Possible Unhanled Promise Rejection`.

The HTTP request is never acutally sent due to the incorrect form data type casting.

This sample app provides the following:
- A React Native Windows app making a trivial `POST` request with a form data payload.
- A React Native macOS projection of the app for control/reference.

## Environment

- `react-native-windows` version `0.72.20` and earlier

## Instructions

1.  Start the app and sample server
    ```pwsh
    yarn
    yarn windows
    php -S localhost:5000 formupload.php
    ```
2.  Click on the `Send` button.
