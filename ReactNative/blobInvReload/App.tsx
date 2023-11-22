/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @see https://retool.com/blog/the-react-lifecycle-methods-and-hooks-explained
 * @format
 */

import React, {useState} from 'react';
import {Button, StyleSheet, Text, View} from 'react-native';

const App = () => {
	const [content, setContent] = useState('NOTHING');
	const uri =
		'https://raw.githubusercontent.com/microsoft/react-native-windows/main/.yarnrc.yml';

	const doFetch = async () => {
		var response = await fetch(uri);
		var text = await response.text();
		setContent(text);
	};

	return (
		<View
			style={{
				flex: 1,
				justifyContent: 'center',
			}}>
			<Text style={styles.text}>Instructions</Text>
			<Text style={styles.text}>
				1. Click on [Reload]. Text should go from [NOTHING] TO [enableScripts: false].
			</Text>
			<Text style={styles.text}>
				2. Open the dev menu, select 'Reload Javascript'.
			</Text>
			<Text style={styles.text}>
				3. Click on [Reload]. Text will not update. Exception will happen.
			</Text>
			<Text style={styles.text}></Text>
			<Text style={styles.text}>[{content}]</Text>
			<Button onPress={doFetch} title="Reload" />
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
