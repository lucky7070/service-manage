import { useWindowDimensions } from "react-native";

const LIST_MAX_HEIGHT_RATIO = 0.38;
const LIST_MAX_HEIGHT_CAP = 320;

export function useMaxListHeight(maxRatio: number = LIST_MAX_HEIGHT_RATIO, maxCap: number = LIST_MAX_HEIGHT_CAP) {
    const { height } = useWindowDimensions();
    return Math.min(height * maxRatio, maxCap);
}
