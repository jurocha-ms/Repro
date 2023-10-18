/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @see https://retool.com/blog/the-react-lifecycle-methods-and-hooks-explained
 * @format
 */

import React, {useState} from 'react';
import {Button, StyleSheet, Text, TextInput, View} from 'react-native';

const App = () => {
	const [content, setContent] = useState('NOTHING');
	const [reqId, setReqId] = useState(0);
	const [size, setSize] = useState(`${1024 * 1024}`);
	const uri =
		`http://localhost:5000/${size}`;

	const doFetch = async () => {
		var response = await fetch(uri);
		var text = await response.text();
		setReqId(reqId + 1);
		setContent(`${text.length}`);
	};

	return (
		<View
			style={{
				flex: 1,
				justifyContent: 'center',
			}}>
			<Button onPress={doFetch} title="Reload" />
			<TextInput
				style={styles.input}
				onChangeText={setSize}
				value={size} />
			<Text></Text>
			<Text style={styles.text}>Response {reqId}:</Text>
			<Text style={styles.text}>[{content}]</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	text: {
		textAlign: 'center',
	},
	input: {
		textAlign: 'center',
		color: 'white',
		backgroundColor: '#003269',
		fontWeight: 'bold',
	}
});

export default App;
