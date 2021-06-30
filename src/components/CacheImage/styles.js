import { StyleSheet } from 'react-native';
import { colors } from '@/styles';

const styles = StyleSheet.create({
    image: {
        zIndex: 3,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.veryLightGray
    },
    loader: {
        backgroundColor: colors.veryLightGray,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 3,
        justifyContent: 'center',
        alignItems: 'center'
    }
});

export default styles;
