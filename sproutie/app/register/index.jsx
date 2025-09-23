import React, { useState } from "react";
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    Image, 
    Alert, 
    KeyboardAvoidingView, 
    ScrollView, 
    Platform 
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { router } from "expo-router";
import { auth } from "../firebase/config";
import apiService from "../services/apiService";
import styles from "./styles";

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        // Input validation
        if (!email || !password || !confirmPassword) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        if (password.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters long");
            return;
        }

        setLoading(true);

        try {
            // Step 1: Create user in Firebase
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;
            
            console.log("Firebase user created:", firebaseUser.uid);

            // Step 2: Create user in MongoDB
            try {
                const userData = {
                    firebaseUid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                    emailVerified: firebaseUser.emailVerified
                };

                const response = await apiService.createUser(userData);
                console.log("MongoDB user created:", response);

                Alert.alert("Success", "Account created successfully!");
                
                // Clear form
                setEmail("");
                setPassword("");
                setConfirmPassword("");

            } catch (mongoError) {
                console.error("MongoDB error:", mongoError);
                Alert.alert(
                    "Partial Success", 
                    "Account created but profile setup failed. You can still log in.",
                    [{ text: "OK", onPress: () => router.push('/login') }]
                );
            }

        } catch (error) {
            console.error("Registration error:", error);
            
            // Handle specific Firebase errors
            let errorMessage = "An error occurred during registration";
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = "This email is already registered";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "Please enter a valid email address";
            } else if (error.code === 'auth/weak-password') {
                errorMessage = "Password is too weak";
            }
            
            Alert.alert("Registration Error", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <ScrollView 
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Image
                            source={require("../../assets/images/logo.png")}
                            style={styles.logo}
                        />
                        <Text style={styles.title}>Sproutie</Text>
                        <Text style={styles.description}>Create your account</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.input}>
                            <Text style={styles.text}>Email</Text>
                            <TextInput
                                style={styles.textInput}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>
                        <View style={styles.input}>
                            <Text style={styles.text}>Password</Text>
                            <TextInput
                                style={styles.textInput}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>
                        <View style={styles.input}>
                            <Text style={styles.text}>Confirm Password</Text>
                            <TextInput
                                style={styles.textInput}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        <View style={styles.formFooter}>
                            <TouchableOpacity 
                                style={[styles.button, loading && { opacity: 0.7 }]} 
                                onPress={handleRegister}
                                disabled={loading}
                            >
                                <Text style={styles.buttonText}>
                                    {loading ? "Creating Account..." : "Sign Up"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account?</Text>
                        <TouchableOpacity onPress={() => router.push('/login')}>
                            <Text style={styles.footerLink}> Login</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}