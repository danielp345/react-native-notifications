import { StatusBar } from "expo-status-bar"
import { Alert, Button, Platform, StyleSheet, View } from "react-native"
import * as Notifications from "expo-notifications"
import * as Device from "expo-device"
import { useEffect, useState } from "react"

Notifications.setNotificationHandler({
	handleNotification: async () => {
		return {
			shouldPlaySound: false,
			shouldSetBadge: true,
			shouldShowAlert: true,
		}
	},
})

export default function App() {
	const [expoToken, setExpoToken] = useState("")

	useEffect(() => {
		const registerForPushNotificationAsync = async () => {
			if (!Device.deviceName.includes("sdk")) {
				const { status: existingStatus } =
					await Notifications.getPermissionsAsync()
				let finalResult = existingStatus

				if (existingStatus !== "granted") {
					const { status } = await Notifications.requestPermissionsAsync()
					finalResult = status
				}

				if (finalResult !== "granted") {
					Alert.alert("Failed to get push token for push notification!")
					return
				}

				const token = (await Notifications.getExpoPushTokenAsync()).data
				setExpoToken(token)

				if (Platform.OS === "android") {
					Notifications.setNotificationChannelAsync("default", {
						name: "default",
						importance: Notifications.AndroidImportance.MAX,
						vibrationPattern: [0, 250, 250, 250],
						lightColor: "#FF231F7C",
					})
				}
			} else {
				alert("Must use physical device for Push Notifications")
			}
		}

		registerForPushNotificationAsync()
	}, [])

	useEffect(() => {
		const subscription1 = Notifications.addNotificationReceivedListener(
			(notification) => {
				const userName = notification.request.content.data.userName
				console.log(userName)
			}
		)

		const subscription2 = Notifications.addNotificationResponseReceivedListener(
			(response) => {
				const userName = response.notification.request.content.data.userName
				console.log(userName)
			}
		)

		return () => {
			subscription1.remove()
			subscription2.remove()
		}
	}, [])

	const scheduleNotificationHandler = () => {
		Notifications.scheduleNotificationAsync({
			content: {
				title: "My first local notification",
				body: "Body of the notification",
				data: { userName: "someone" },
			},
			trigger: {
				seconds: 5,
			},
		})
	}

	const sendPushNotificationHandler = () => {
		fetch("https://exp.host/--/api/v2/push/send", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				to: expoToken,
				title: "Test",
				body: "test",
			}),
		})
	}

	return (
		<View style={styles.container}>
			<Button
				title="Schedule Notification"
				onPress={scheduleNotificationHandler}
			/>
			<Button
				title="Send Push Notification"
				onPress={sendPushNotificationHandler}
			/>
			<StatusBar style="auto" />
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
	},
})
