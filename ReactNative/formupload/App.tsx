/**
 * Multipart file upload test
 *
 * @see https://github.com/microsoft/react-native-windows/issues/12168
 * @format
 */

import React, {useEffect, useState} from 'react';
import {Button, Text, View} from 'react-native';
import axios from 'axios';

const App = () => {
	const [content, setContent] = useState('NOTHING');
	const uri = 'http://localhost:5000/rn/formup';

	const doForm = async () => {
		const formData = new FormData();
		formData.append('username', 'test');

		var response = await fetch(uri, {body: formData, method: 'POST'});
		var text = await response.text();
		setContent(text);
	};

	return (
		<View
			style={{
				flex: 1,
				justifyContent: 'flex-start',
				alignItems: 'stretch',
			}}>
			<Text>username: [{content}]</Text>
			<Button onPress={doForm} title="Send" />
		</View>
	);
};

export default App;
