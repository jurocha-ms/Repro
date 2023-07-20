/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @see https://retool.com/blog/the-react-lifecycle-methods-and-hooks-explained
 * @format
 */

import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';

const App = () => {

	const [content, setContent] = useState('NOTHING')
	const uri = 'https://raw.githubusercontent.com/microsoft/react-native-windows/main/.yarnrc.yml'

	useEffect(() => {
		const doFetch = async () => {
			var response = await fetch(uri)
			var text = await response.text()
			setContent(text)
		}

		doFetch().catch(console.error)
	}, [])

	return (
		<View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
			<Text>Content:</Text>
			<Text>[{content}]</Text>
		</View>
	)
}

export default App
