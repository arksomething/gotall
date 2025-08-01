import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FOOD_ANALYSIS_PROMPT } from "../../utils/prompts";

export default function Food() {
  const [images, setImages] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    if (images.length >= 3) {
      alert("You can only select up to 3 photos.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "Images" as any,
      allowsEditing: false,
      quality: 1,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      const newImages = result.assets.map((asset) => asset.uri);
      const totalImages = images.length + newImages.length;

      if (totalImages > 3) {
        alert("You can only select up to 3 photos total.");
        return;
      }

      setImages((prevImages) => [...prevImages, ...newImages]);
    }
  };

  const takePhoto = async () => {
    if (images.length >= 3) {
      alert("You can only select up to 3 photos.");
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera permissions to make this work!");
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      setImages((prevImages) => [...prevImages, result.assets[0].uri]);
    }
  };

  const removeImage = (uriToRemove: string) => {
    setImages(images.filter((uri) => uri !== uriToRemove));
  };

  const clearImages = () => {
    setImages([]);
    setAnalysis("");
  };

  const analyzeImages = async () => {
    if (images.length === 0) {
      alert("Please select at least one image.");
      return;
    }
    setIsLoading(true);
    setAnalysis("");

    try {
      const base64Images = await Promise.all(
        images.map((uri) =>
          FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          })
        )
      );

      const response = await fetch(
        "https://us-central1-gotall.cloudfunctions.net/foodAnalyzer",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            images: base64Images,
            prompt: FOOD_ANALYSIS_PROMPT,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAnalysis(data.reply);
    } catch (error) {
      console.error("Analysis request failed:", error);
      alert("Failed to get analysis. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.cardStyle}>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
            <Text style={styles.actionButtonText}>Pick Images</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
            <Text style={styles.actionButtonText}>Take Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.pickerContainer}>
          {images.length > 0 ? (
            <ScrollView horizontal style={styles.scrollView}>
              {images.map((uri, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{ uri }} style={styles.image} />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeImage(uri)}
                  >
                    <Ionicons name="close" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>Max three photos</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.updateButton,
            (isLoading || images.length === 0) && styles.updateButtonDisabled,
          ]}
          onPress={analyzeImages}
          disabled={isLoading || images.length === 0}
        >
          <Ionicons name="analytics-outline" size={24} color="#000" />
          <Text style={styles.updateButtonText}>
            {isLoading ? "Analyzing..." : "Analyze Meal"}
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading && (
        <ActivityIndicator size="large" color="#9ACD32" style={styles.loader} />
      )}

      {analysis && (
        <View style={styles.analysisContainer}>
          <Text style={styles.analysisTitle}>Analysis:</Text>
          <Text style={styles.analysisText}>{analysis}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    padding: 20,
  },
  cardStyle: {
    backgroundColor: "#111",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    width: "100%",
    alignItems: "center",
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 30,
    width: "100%",
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#9ACD32",
  },
  actionButtonText: {
    color: "#9ACD32",
    fontWeight: "600",
    fontSize: 14,
  },
  scrollView: {
    maxHeight: 160,
    marginBottom: 20,
  },
  imageContainer: {
    position: "relative",
    marginRight: 10,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 10,
  },
  removeButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  placeholderContainer: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
    flex: 1,
  },
  placeholderText: {
    color: "#666",
    fontSize: 12,
    fontStyle: "italic",
    textAlign: "center",
  },
  loader: {
    marginVertical: 20,
  },
  analysisContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    width: "100%",
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  analysisText: {
    fontSize: 16,
    color: "#eee",
    lineHeight: 24,
  },
  pickerContainer: {
    width: "100%",
    marginBottom: 30,
  },
  updateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#9ACD32",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    minWidth: 120,
    justifyContent: "center",
  },
  updateButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  updateButtonDisabled: {
    backgroundColor: "#666",
  },
});
