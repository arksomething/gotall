import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import { Header } from "../../components/Header";
import { Stretch, stretches } from "../../utils/stretches";

const { width: screenWidth } = Dimensions.get("window");

export default function HabitScreen() {
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [selectedStretch, setSelectedStretch] = useState<Stretch>(stretches[4]); // Default to "Forward Bend"
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const toggleCard = (index: number) => {
    setSelectedCards((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const selectStretch = (stretch: Stretch) => {
    setSelectedStretch(stretch);
    setDropdownVisible(false);
  };

  const getYouTubeEmbedUrl = (videoId: string) => {
    return `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&showinfo=0&rel=0`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Exercises" />

      {/* Exercise Selection */}
      <View style={styles.exerciseSection}>
        <TouchableOpacity
          style={styles.exerciseDropdown}
          onPress={() => setDropdownVisible(true)}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View style={styles.dropdownContent}>
            <Text style={styles.exerciseText}>Click to find exercises</Text>
            <Ionicons name="chevron-down" size={16} color="#fff" />
          </View>
        </TouchableOpacity>

        <View style={styles.currentExercise}>
          <Text style={styles.exerciseTitle}>{selectedStretch.name}</Text>
          <Text style={styles.exerciseEmoji}>{selectedStretch.emoji}</Text>
        </View>
      </View>

      {/* Stretch Details */}
      <ScrollView style={styles.detailsView}>
        {/* Video */}
        <View style={styles.videoContainer}>
          <WebView
            source={{ uri: getYouTubeEmbedUrl(selectedStretch.youtubeId) }}
            style={styles.webView}
            allowsFullscreenVideo={true}
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
          />
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          {selectedStretch.description.map((step, index) => (
            <Text key={index} style={styles.instructionStep}>
              {index + 1}. {step}
            </Text>
          ))}
        </View>
      </ScrollView>

      {/* Dropdown Modal */}
      <Modal
        visible={dropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setDropdownVisible(false)}
          activeOpacity={1}
        >
          <TouchableOpacity
            style={styles.dropdownModal}
            activeOpacity={1}
            onPress={() => {}}
          >
            <Text style={styles.modalTitle}>Streches</Text>
            <ScrollView style={styles.modalContent}>
              {stretches.map((stretch, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dropdownItem}
                  onPress={() => selectStretch(stretch)}
                >
                  <Text style={styles.dropdownEmoji}>{stretch.emoji}</Text>
                  <View style={styles.dropdownMainArea}>
                    <Text style={styles.dropdownItemText}>{stretch.name}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  exerciseSection: {
    paddingHorizontal: 24,
    marginTop: 10,
  },
  exerciseDropdown: {
    backgroundColor: "#333",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#555",
  },
  dropdownContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  exerciseText: {
    color: "#fff",
    fontSize: 14,
    flex: 1,
  },
  currentExercise: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  exerciseTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    marginRight: 10,
  },
  exerciseEmoji: {
    fontSize: 20,
  },
  cardsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  largeCard: {
    height: 120,
    backgroundColor: "#666",
    borderRadius: 12,
    marginBottom: 15,
  },
  smallCardsRow: {
    flexDirection: "row",
    gap: 15,
  },
  smallCard: {
    flex: 1,
    height: 80,
    backgroundColor: "#333",
    borderRadius: 12,
  },
  greenCard: {
    backgroundColor: "#9ACD32",
  },
  selectedCard: {
    backgroundColor: "#555",
    borderWidth: 2,
    borderColor: "#9ACD32",
  },
  selectedGreenCard: {
    backgroundColor: "#7BA428",
    borderWidth: 2,
    borderColor: "#fff",
  },
  submitButton: {
    backgroundColor: "#9ACD32",
    marginHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 20,
  },
  submitText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownModal: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    width: "90%",
    height: "70%",
    marginHorizontal: 20,
  },
  modalTitle: {
    color: "#9ACD32",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    padding: 20,
    paddingBottom: 10,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  dropdownEmoji: {
    fontSize: 24,
    width: 30,
  },
  dropdownMainArea: {
    flex: 1,
  },
  dropdownItemText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  infoButton: {
    padding: 5,
  },
  detailButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#333",
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  detailButtonText: {
    color: "#9ACD32",
    fontSize: 12,
    marginRight: 6,
  },
  detailModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  detailModal: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    width: "95%",
    maxHeight: "90%",
    marginHorizontal: 10,
  },
  detailContent: {
    padding: 20,
  },
  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  detailTitle: {
    color: "#9ACD32",
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
  },
  sectionTitle: {
    color: "#9ACD32",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
  },
  videoContainer: {
    height: 200,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#000",
    marginHorizontal: 20,
    marginBottom: 10,
  },
  webView: {
    flex: 1,
  },
  instructionsContainer: {
    backgroundColor: "#2a2a2a",
    margin: 20,
    padding: 15,
    borderRadius: 8,
  },
  instructionStep: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  targetsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  targetTag: {
    backgroundColor: "#333",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  targetText: {
    color: "#9ACD32",
    fontSize: 12,
    fontWeight: "500",
  },
  durationDetail: {
    color: "#fff",
    fontSize: 16,
    backgroundColor: "#2a2a2a",
    padding: 10,
    borderRadius: 8,
  },
  mainContent: {
    flex: 1,
  },
  detailsView: {
    flex: 1,
  },
  detailsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  detailsTitle: {
    color: "#9ACD32",
    fontSize: 20,
    fontWeight: "bold",
  },
  backButton: {
    padding: 5,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});
