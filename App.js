import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Linking, StyleSheet } from 'react-native';
import { CameraView, Camera } from 'expo-camera';

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [questionData, setQuestionData] = useState(null);
  const [showCamera, setShowCamera] = useState(true);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setShowCamera(false);
    fetchQuestion(data);
  };

  const fetchQuestion = async (url) => {
    try {
      const response = await fetch(url);
      const data = await response.json();
      setQuestionData(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch question');
    }
  };

  const submitAnswer = async (selectedAnswer) => {
    try {
      const response = await fetch('https://f769c051-c74b-429b-86b7-9624edfecb75.mock.pstmn.io/question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answer: selectedAnswer
        }),
      });
      
      const result = await response.json();
      
      if (result.is_correct) {
        Alert.alert('Correct!', 'Opening next location in maps', [
          {
            text: 'OK',
            onPress: () => openMaps(result.coordinates)
          }
        ]);
      } else {
        Alert.alert('Incorrect', 'Try again');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit answer');
    }
  };

  const openMaps = (coordinates) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${coordinates}`;
    Linking.openURL(url);
    resetApp();
  };

  const resetApp = () => {
    setScanned(false);
    setQuestionData(null);
    setShowCamera(true);
  };

  if (hasPermission === null) {
    return <Text>Requesting camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  if (showCamera && !scanned) {
    return (
      <View style={styles.container}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />
        {scanned && (
          <TouchableOpacity 
            style={styles.button}
            onPress={() => setScanned(false)}
          >
            <Text style={styles.buttonText}>Tap to Scan Again</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (questionData) {
    return (
      <View style={styles.questionContainer}>
        <Text style={styles.question}>{questionData.question}</Text>
        {questionData.choices.map((choice, index) => (
          <TouchableOpacity
            key={index}
            style={styles.choiceButton}
            onPress={() => submitAnswer(choice)}
          >
            <Text style={styles.choiceText}>{choice}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.resetButton} onPress={resetApp}>
          <Text style={styles.buttonText}>Scan New QR Code</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  questionContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  question: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  choiceButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    margin: 10,
    borderRadius: 8,
  },
  choiceText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    margin: 20,
    borderRadius: 8,
  },
  resetButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    margin: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});