import { View, Text, Pressable, Modal, ScrollView } from "react-native";
import tw from "../lib/tw";
import type { Exercise } from "@repped/shared";

interface Props {
  visible: boolean;
  alternatives: Exercise[];
  onSelect: (exercise: Exercise) => void;
  onClose: () => void;
}

export default function ExerciseSwapModal({ visible, alternatives, onSelect, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={tw`flex-1 justify-end bg-black/60`}>
        <View style={tw`bg-gray-900 rounded-t-3xl p-6 max-h-[70%]`}>
          <View style={tw`flex-row justify-between items-center mb-4`}>
            <Text style={tw`text-white text-xl font-bold`}>Swap Exercise</Text>
            <Pressable onPress={onClose}>
              <Text style={tw`text-gray-400 text-lg`}>Cancel</Text>
            </Pressable>
          </View>
          <Text style={tw`text-gray-500 text-sm mb-4`}>
            Same muscle group, different movement. Pick one:
          </Text>
          <ScrollView>
            {alternatives.map((ex) => (
              <Pressable
                key={ex.id}
                onPress={() => onSelect(ex)}
                style={tw`bg-gray-800 rounded-2xl p-4 mb-3`}
              >
                <Text style={tw`text-white text-lg font-semibold mb-1`}>{ex.name}</Text>
                <Text style={tw`text-gray-400 text-sm mb-1`}>
                  {ex.default_sets} sets x {ex.default_reps} reps
                </Text>
                <Text style={tw`text-gray-500 text-xs`}>{ex.explain_eli5}</Text>
              </Pressable>
            ))}
            {alternatives.length === 0 && (
              <Text style={tw`text-gray-500 text-center py-8`}>No alternatives available</Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
