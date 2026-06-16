import { Pressable, View } from "react-native";
import * as Haptics from 'expo-haptics';

export function SliderDiscreto({ valor, onChange, color }: { 
    valor: number, 
    onChange: (v: number) => void,
    color: string 
}) {
    const pasos = [1, 2, 3, 4, 5];

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {pasos.map((paso) => (
                <Pressable
                    key={paso}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        onChange(paso);
                    }}
                    style={{
                        flex: 1,
                        height: 36,
                        borderRadius: 8,
                        backgroundColor: paso <= valor ? color : '#e0e0e0',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                />
            ))}
        </View>
    );
};