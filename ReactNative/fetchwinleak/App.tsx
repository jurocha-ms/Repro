/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @see https://retool.com/blog/the-react-lifecycle-methods-and-hooks-explained
 * @format
 */

import React, {useEffect, useState} from 'react';
import {Button, Text, TextInput, View} from 'react-native';

const App = () => {
	const [content, setContent] = useState('NOTHING');
	const [reqId, setReqId] = useState(0);
	const [size, setSize] = useState(`${1024 * 1024}`);
	//const size = 1024 * 1024;//TODO: Set in GUI
	const uri =
		`http://localhost:5000/${size}`;

	const doFetch = async () => {
		var response = await fetch(uri);
		var text = await response.text();
		setReqId(reqId + 1);
		setContent(`${text.length}`);
	};

	useEffect(() => {
		//doFetch().catch(console.error);
	}, []);

	return (
		<View
			style={{
				flex: 1,
				justifyContent: 'flex-start',
				alignItems: 'stretch',
			}}>
			<Text>Response {reqId}:</Text>
			<Button onPress={doFetch} title="Reload" />
			<TextInput onChangeText={setSize}>{size}</TextInput>
			<Text>[{content}]</Text>
		</View>
	);
};

export default App;
