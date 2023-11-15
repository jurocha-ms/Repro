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
	const [total, setTotal] = useState(0);
	const [reqId, setReqId] = useState(0);
	const [size, setSize] = useState(`${8 * 1024 * 1024}`);
	const uri = `http://localhost:5000/${size}`;

	const doFetch = async () => {
		var response = await fetch(uri);
		var text = await response.text();
		setReqId(reqId + 1);
		setTotal(total + text.length);
		setReqId(reqId + 1);

		//WORKS
		//global.__blobCollectorProvider('F06550FF-B557-402A-93D8-45019B8BA19E');

		//FAILS
		//await fetch(uri);
		//FAILS?
		//await (await fetch(uri)).text();

		//FAILS without explicit GC
		//await new Blob(['0123456789ABCDEF']);
		//WORKS
		//await (await new Blob(['0123456789ABCDEF'])).text();

		// var cont = '0123456789ABCDEF';
		// while (cont.length < 8 * 1024 * 1024) {
		// 	cont += cont;
		// }
		// await (await new Blob([cont])).text();

		//global.gc();
	};

	return (
		<View
			style={{
				flex: 1,
				justifyContent: 'center',
			}}>
			<Button onPress={doFetch} title="Reload" />
			<TextInput style={styles.input} onChangeText={setSize} value={size} />
			<Text></Text>
			<Text style={styles.text}>Responses: {reqId}</Text>
			<Text style={styles.text}>[{total}]</Text>
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
	},
});

export default App;
