/**
 * Multipart file upload test
 *
 * @see https://github.com/microsoft/react-native-windows/issues/12168
 * @format
 */

import React, {useEffect, useState} from 'react';
import {Button, Text, View} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import axios from 'axios';

const App = () => {
	const [content, setContent] = useState('NOTHING');
	const [reqId, setReqId] = useState(0);
	const uri =
		'https://raw.githubusercontent.com/microsoft/react-native-windows/main/.yarnrc.yml';
	//	'http://localhost:5555';

	// const doFetch = async () => {
	// 	var response = await fetch(uri);
	// 	var text = await response.text();
	// 	setReqId(reqId + 1);
	// 	setContent(text);
	// };

	const uploadFile = async () => {
		const pickerResult = await DocumentPicker.pickSingle({
			presentationStyle: 'fullScreen',
			copyTo: 'documentDirectory',
			type: [DocumentPicker.types.allFiles],
			mode: 'import',
		});
		console.log(pickerResult);
	};

	const uploadImage = async (file) => {
		const formData = new FormData();
		formData.append('file', {
			uri: file.fileCopyUri,
			type: file.type,
			name: file.name,
			fileName: file.name,
			size: file.size,
		});
		console.log(formData);

		try {
			const response = await axios.post(
				'SOME URL',
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				},
			);

			console.log('Image upload success:', response.data);
		} catch (error) {
			console.error('Image upload error:', error);
		}
	};

	// useEffect(() => {
	// 	doFetch().catch(console.error);
	// }, []);

	return (
		<View
			style={{
				flex: 1,
				justifyContent: 'flex-start',
				alignItems: 'stretch',
			}}>
			{/* <Text>Response {reqId}:</Text>
			<Text>[{content}]</Text>
			<Button onPress={doFetch} title="Reload" /> */}
			<Text>Chale</Text>
			<Button onPress={uploadFile} title="Open" />
		</View>
	);
};

export default App;
