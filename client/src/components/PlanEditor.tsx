import { PlanDetail } from '@/utils/IPlan'
import React, { useEffect, useState } from 'react'
import { 
    Save, 
    Plus, 
    Trash2, 
    DollarSign, 
    Tag, 
    CheckCircle2, 
    AlertCircle,
    Package
} from 'lucide-react'

const PlanEditor = ({ plan }: { plan: PlanDetail }) => {
    const [formData, setFormData] = useState<PlanDetail | undefined>(undefined)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (plan) setFormData(plan)
    }, [plan])

    const handleBasicChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, type, value } = e.target
        const finalValue =
            type === 'checkbox'
                ? (e.target as HTMLInputElement).checked
                : value;

        setFormData(prev => {
            if (!prev) return prev
            return { ...prev, [name]: finalValue }
        })
    }

    const handleFeatureValueChange = (index: number, value: string) => {
        if (!formData?.features) return
        const updated = [...formData.features]
        updated[index] = { ...updated[index], value: value } // Immutable update

        setFormData(prev => {
            if (!prev) return prev
            return { ...prev, features: updated }
        })
    }

    const addFeatureRow = () => {
        const first = formData?.features[0]
        if (!first) return
        setFormData(prev => {
            if (!prev) return prev
            return {
                ...prev,
                features: [...(prev.features || []), first]
            }
        })
    }

    const removeFeatureRow = (index: number) => {
        setFormData(prev => {
            if (!prev) return prev
            return {
                ...prev,
                features: prev.features.filter((_, i) => i !== index)
            }
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        
        // Giả lập API call
        await new Promise(resolve => setTimeout(resolve, 800))
        
        console.log('PUT payload:', JSON.stringify(formData, null, 2))
        alert('Saved successfully!')
        setIsSaving(false)
    }

    if (!formData) return <div className="p-10 text-center text-gray-500">Loading plan data...</div>

    return (
        <div className="max-w-5xl mx-auto p-8">
            <div className="bg-white shadow-xl shadow-gray-100 rounded-2xl border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <Package className="w-6 h-6 text-blue-600" />
                            Edit Subscription Plan
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">Update plan details and feature limits.</p>
                    </div>
                    <div className="flex gap-2">
                         <span className={`px-3 py-1 rounded-full text-xs font-medium border ${formData.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                            {formData.isActive ? 'Live' : 'Draft'}
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* General Information Section */}
                    <section>
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> General Info
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Plan Name */}
                            <div className="group">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Tag className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                    <input
                                        name="name"
                                        value={formData.name || ''}
                                        onChange={handleBasicChange}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                        placeholder="e.g. Pro Plan"
                                    />
                                </div>
                            </div>

                            {/* Price */}
                            <div className="group">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Price</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <DollarSign className="h-4 w-4 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                                    </div>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price || 0}
                                        onChange={handleBasicChange}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm font-mono"
                                        placeholder="0.00"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="text-gray-400 text-xs">USD</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                name="description"
                                value={formData.description || ''}
                                onChange={handleBasicChange}
                                rows={3}
                                className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm resize-none"
                                placeholder="Describe what makes this plan special..."
                            />
                        </div>
                    </section>
                    
                    <hr className="border-gray-100" />

                    {/* Settings / Toggles Section */}
                    <section>
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> Settings
                        </h3>
                        <div className="flex flex-col sm:flex-row gap-8">
                            {/* Toggle: Badge */}
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input 
                                        type="checkbox" 
                                        name="badge"
                                        checked={formData.badge || false} 
                                        onChange={handleBasicChange}
                                        className="sr-only peer" 
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-700">Recommended Badge</span>
                                    <span className="text-xs text-gray-500">{`Highlight this plan as "Popular"`}</span>
                                </div>
                            </label>

                            {/* Toggle: Active */}
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input 
                                        type="checkbox" 
                                        name="isActive"
                                        checked={formData.isActive || false} 
                                        onChange={handleBasicChange}
                                        className="sr-only peer" 
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-700">Active Status</span>
                                    <span className="text-xs text-gray-500">Visible to customers</span>
                                </div>
                            </label>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Features List */}
                    <section>
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Features Configuration</h3>
                                <p className="text-xs text-gray-500 mt-1">Define limits and capabilities for this plan.</p>
                            </div>
                            <button
                                type="button"
                                onClick={addFeatureRow}
                                className="text-sm flex items-center gap-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors font-medium"
                            >
                                <Plus className="w-4 h-4" /> Add Feature
                            </button>
                        </div>

                        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                            <div className="grid grid-cols-12 gap-4 bg-gray-50 px-4 py-3 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                                <div className="col-span-6 md:col-span-7">Feature Name</div>
                                <div className="col-span-5 md:col-span-4">Value</div>
                                <div className="col-span-1 text-right"></div>
                            </div>
                            
                            <div className="divide-y divide-gray-100">
                                {formData.features?.map((f, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-gray-50 transition-colors group">
                                        <div className="col-span-6 md:col-span-7">
                                            <span className="text-sm text-gray-700 font-medium block truncate" title={f.featureName}>
                                                {f.featureName}
                                            </span>
                                        </div>

                                        <div className="col-span-5 md:col-span-4">
                                            {['true', 'false'].includes(f.value.toString()) ? (
                                                <select
                                                    value={f.value}
                                                    onChange={e => handleFeatureValueChange(index, e.target.value)}
                                                    className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 py-1.5 bg-white"
                                                >
                                                    <option value="true">Included (Yes)</option>
                                                    <option value="false">Excluded (No)</option>
                                                </select>
                                            ) : (
                                                <input
                                                    value={f.value}
                                                    onChange={e => handleFeatureValueChange(index, e.target.value)}
                                                    className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 py-1.5 px-2"
                                                    placeholder="Value"
                                                />
                                            )}
                                        </div>

                                        <div className="col-span-1 flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => removeFeatureRow(index)}
                                                className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                                title="Remove feature"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {(!formData.features || formData.features.length === 0) && (
                                    <div className="p-8 text-center text-gray-400 text-sm">
                                        {`No features defined. Click "Add Feature" to start.`}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Footer Actions */}
                    <div className="flex justify-end pt-4">
                        <button
                            type="button"
                            className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg mr-3 text-sm font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm shadow-blue-200 text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" /> Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default PlanEditor