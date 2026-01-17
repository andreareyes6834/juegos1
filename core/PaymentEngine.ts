// ==========================================
// PAYPAL PAYMENT INTEGRATION
// ==========================================

export enum TransactionStatus {
    PENDING = 'PENDING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED'
}

export interface TokenPackage {
    id: string;
    name: string;
    hardTokens: number;
    bonusTokens: number;
    priceUSD: number;
    popular?: boolean;
}

export interface Transaction {
    id: string;
    userId: string;
    packageId: string;
    amountUSD: number;
    hardTokens: number;
    status: TransactionStatus;
    paypalOrderId?: string;
    paypalTransactionId?: string;
    createdAt: Date;
    completedAt?: Date;
}

// ==========================================
// PAYMENT ENGINE
// ==========================================
export class PaymentEngine {
    private transactions: Map<string, Transaction> = new Map();

    // Token packages available for purchase
    getTokenPackages(): TokenPackage[] {
        return [
            {
                id: 'starter',
                name: 'Starter Pack',
                hardTokens: 100,
                bonusTokens: 0,
                priceUSD: 0.99
            },
            {
                id: 'basic',
                name: 'Basic Pack',
                hardTokens: 500,
                bonusTokens: 50,
                priceUSD: 4.99
            },
            {
                id: 'premium',
                name: 'Premium Pack',
                hardTokens: 1200,
                bonusTokens: 200,
                priceUSD: 9.99,
                popular: true
            },
            {
                id: 'mega',
                name: 'Mega Pack',
                hardTokens: 2500,
                bonusTokens: 500,
                priceUSD: 19.99
            },
            {
                id: 'ultimate',
                name: 'Ultimate Pack',
                hardTokens: 5500,
                bonusTokens: 1500,
                priceUSD: 39.99
            }
        ];
    }

    // Step 1: Create internal transaction
    createTransaction(userId: string, packageId: string): Transaction {
        const packages = this.getTokenPackages();
        const pkg = packages.find(p => p.id === packageId);

        if (!pkg) throw new Error('Invalid package');

        const transaction: Transaction = {
            id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId,
            packageId,
            amountUSD: pkg.priceUSD,
            hardTokens: pkg.hardTokens + pkg.bonusTokens,
            status: TransactionStatus.PENDING,
            createdAt: new Date()
        };

        this.transactions.set(transaction.id, transaction);
        return transaction;
    }

    // Step 2: Create PayPal order (frontend calls this)
    async createPayPalOrder(transactionId: string): Promise<string> {
        const transaction = this.transactions.get(transactionId);
        if (!transaction) throw new Error('Transaction not found');

        // In real implementation, this would call PayPal API
        const paypalOrderId = `PAYPAL_ORDER_${Date.now()}`;
        transaction.paypalOrderId = paypalOrderId;

        return paypalOrderId;
    }

    // Step 3: PayPal webhook handler (server-side)
    async handlePayPalWebhook(webhookData: any): Promise<Transaction | null> {
        // Verify webhook signature (CRITICAL for security)
        if (!this.verifyWebhookSignature(webhookData)) {
            console.error('⚠️ Invalid webhook signature');
            return null;
        }

        const paypalOrderId = webhookData.resource?.id;
        const paypalTransactionId = webhookData.resource?.purchase_units?.[0]?.payments?.captures?.[0]?.id;

        // Find transaction by PayPal order ID
        const transaction = Array.from(this.transactions.values())
            .find(t => t.paypalOrderId === paypalOrderId);

        if (!transaction) {
            console.error('⚠️ Transaction not found for PayPal order:', paypalOrderId);
            return null;
        }

        // Update transaction status
        if (webhookData.event_type === 'CHECKOUT.ORDER.COMPLETED') {
            transaction.status = TransactionStatus.SUCCESS;
            transaction.paypalTransactionId = paypalTransactionId;
            transaction.completedAt = new Date();

            console.log('✅ Payment confirmed:', transaction.id);
            return transaction;
        }

        if (webhookData.event_type === 'PAYMENT.CAPTURE.REFUNDED') {
            transaction.status = TransactionStatus.REFUNDED;
            console.log('🔄 Payment refunded:', transaction.id);
            return transaction;
        }

        return null;
    }

    // Verify PayPal webhook signature
    private verifyWebhookSignature(webhookData: any): boolean {
        // In production, this would verify the signature using PayPal's SDK
        // Example:
        // const isValid = await paypal.notification.webhookEvent.verify({
        //   webhook_id: process.env.PAYPAL_WEBHOOK_ID,
        //   webhook_event: webhookData,
        //   transmission_id: req.headers['paypal-transmission-id'],
        //   transmission_time: req.headers['paypal-transmission-time'],
        //   cert_url: req.headers['paypal-cert-url'],
        //   auth_algo: req.headers['paypal-auth-algo'],
        //   transmission_sig: req.headers['paypal-transmission-sig']
        // });

        // For now, always return true (THIS IS NOT SECURE FOR PRODUCTION)
        return true;
    }

    // Get transaction status
    getTransaction(transactionId: string): Transaction | undefined {
        return this.transactions.get(transactionId);
    }

    // Get user's transaction history
    getUserTransactions(userId: string, limit: number = 50): Transaction[] {
        return Array.from(this.transactions.values())
            .filter(t => t.userId === userId)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, limit);
    }

    // Admin: Refund transaction
    refundTransaction(transactionId: string): Transaction {
        const transaction = this.transactions.get(transactionId);
        if (!transaction) throw new Error('Transaction not found');

        if (transaction.status !== TransactionStatus.SUCCESS) {
            throw new Error('Can only refund successful transactions');
        }

        transaction.status = TransactionStatus.REFUNDED;
        return transaction;
    }
}

// ==========================================
// PAYPAL CLIENT-SIDE INTEGRATION
// ==========================================

export class PayPalClient {
    private clientId: string;
    private environment: 'sandbox' | 'production';

    constructor(clientId: string, environment: 'sandbox' | 'production' = 'sandbox') {
        this.clientId = clientId;
        this.environment = environment;
    }

    // Load PayPal SDK
    loadSDK(): Promise<void> {
        return new Promise((resolve, reject) => {
            if ((window as any).paypal) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = `https://www.paypal.com/sdk/js?client-id=${this.clientId}&currency=USD`;
            script.onload = () => resolve();
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Render PayPal button
    renderButton(
        containerId: string,
        amount: number,
        onApprove: (orderId: string) => void,
        onError: (error: any) => void
    ): void {
        const paypal = (window as any).paypal;

        if (!paypal) {
            console.error('PayPal SDK not loaded');
            return;
        }

        paypal.Buttons({
            createOrder: (data: any, actions: any) => {
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: amount.toString(),
                            currency_code: 'USD'
                        }
                    }]
                });
            },
            onApprove: async (data: any, actions: any) => {
                const order = await actions.order.capture();
                onApprove(order.id);
            },
            onError: (err: any) => {
                console.error('PayPal error:', err);
                onError(err);
            },
            style: {
                layout: 'vertical',
                color: 'blue',
                shape: 'rect',
                label: 'paypal'
            }
        }).render(`#${containerId}`);
    }
}
