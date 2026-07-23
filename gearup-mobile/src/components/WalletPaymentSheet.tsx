import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { walletService } from '../services/walletService';
import { paymentService } from '../services/paymentService';
import { SPACING, FONT_SIZES, RADIUS } from '../constants';

interface WalletPaymentSheetProps {
  visible: boolean;
  onClose: () => void;
  navigation: any;
  jobId: number;
  jobTitle: string;
  payeeId: number;
  amount: number;
  accentColor?: string;
  onPaid: () => void;
}

export default function WalletPaymentSheet({
  visible, onClose, navigation, jobId, jobTitle, payeeId, amount, accentColor = '#1b4332', onPaid,
}: WalletPaymentSheetProps) {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (visible) {
      setLoading(true);
      walletService.getWallet()
        .then(w => setBalance(w.balance))
        .catch(() => setBalance(0))
        .finally(() => setLoading(false));
    }
  }, [visible]);

  const sufficientBalance = balance >= amount;

  const handlePay = async () => {
    setPaying(true);
    try {
      const payment = await paymentService.createPayment({
        jobId,
        payeeId,
        amount,
        method: 'MOBILE_MONEY', // record-keeping label only — actual funds move via the wallet ledger on the backend
      });
      await paymentService.completePayment(payment.id);
      onPaid();
      onClose();
    } catch (e: any) {
      Alert.alert('Payment Failed', e.message || 'Something went wrong. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  const handleTopUp = () => {
    onClose();
    navigation.navigate('TopUp');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => !paying && onClose()}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={[styles.iconWrap, { backgroundColor: accentColor + '18' }]}>
            <Ionicons name="wallet" size={26} color={accentColor} />
          </View>
          <Text style={styles.title}>Pay for "{jobTitle}"</Text>
          <Text style={styles.amountText}>GHS {amount.toFixed(2)}</Text>

          {loading ? (
            <ActivityIndicator color={accentColor} style={{ marginVertical: SPACING.lg }} />
          ) : sufficientBalance ? (
            <>
              <Text style={styles.balanceText}>Wallet balance: GHS {balance.toFixed(2)}</Text>
              <TouchableOpacity
                style={[styles.payBtn, { backgroundColor: accentColor }]}
                onPress={handlePay}
                disabled={paying}
                activeOpacity={0.85}>
                {paying ? <ActivityIndicator color="#fff" /> : <Text style={styles.payBtnText}>Pay from Wallet</Text>}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.shortfallBox}>
                <Ionicons name="alert-circle-outline" size={16} color="#b45309" />
                <Text style={styles.shortfallText}>
                  Your balance is GHS {balance.toFixed(2)}. You need GHS {(amount - balance).toFixed(2)} more to pay for this job.
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.payBtn, { backgroundColor: accentColor }]}
                onPress={handleTopUp}
                activeOpacity={0.85}>
                <Text style={styles.payBtnText}>Top Up Wallet</Text>
              </TouchableOpacity>
            </>
          )}

          {!paying && (
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  card: { backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: SPACING.xl, width: '100%', alignItems: 'center' },
  iconWrap: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md },
  title: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#1b1b1b', textAlign: 'center' },
  amountText: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: '#1b1b1b', marginTop: 4, marginBottom: SPACING.md },
  balanceText: { fontSize: FONT_SIZES.sm, color: '#6b7280', marginBottom: SPACING.md },
  shortfallBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#fffbeb', borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: '#fde68a', marginBottom: SPACING.md },
  shortfallText: { flex: 1, fontSize: FONT_SIZES.xs, color: '#92400e', lineHeight: 17 },
  payBtn: { width: '100%', paddingVertical: 14, borderRadius: RADIUS.md, alignItems: 'center' },
  payBtnText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#fff' },
  cancelBtn: { marginTop: SPACING.md, padding: 8 },
  cancelText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#9ca3af' },
});