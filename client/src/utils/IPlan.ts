import { PaymentUser } from "./IUser"

export interface FeatureDetail {
    featureId: number
    featureName: string
    valueType: 'string' | 'boolean'
    value: string
}

export interface PlanDetail {
    id: number
    name: string
    price: string
    badge: boolean
    description: string
    isActive?: boolean
    subcriber: number
    features: FeatureDetail[]
}

export interface PlanLevel {
    [key: string]: number
}

export interface AdminPayment {
    id: string
    amount: number
    currency: string
    gateway: string
    gatewayRef: string
    status: string
    description: string
    createdAt: string
    user: PaymentUser
}

export interface Revenue {
    day: number
    total: number
    transactionCount: number
}