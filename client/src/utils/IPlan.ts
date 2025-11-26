export interface FeatureDetail {
    featureId: number
    featureName: string
    valueType: 'string' | 'boolean' | 'number'
    value: string
}

export interface PlanDetail {
    id: number
    name: string
    price: string
    badge: boolean
    description: string
    features: FeatureDetail[]
}

export interface PlanLevel {
    [key: string]: number
}
