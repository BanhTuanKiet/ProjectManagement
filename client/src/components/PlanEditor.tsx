import React, { useState, useEffect } from 'react';

interface Feature {
    featureId: number;
    name: string;
}

interface PlanFeature {
    featureId: number;
    valueType: 'string' | 'boolean';
    value: string;
}

interface Plan {
    planId: number;
    name: string;
    price: number;
    description: string;
    badge: boolean;
    isActive: boolean;
    planFeatures: PlanFeature[];
}

const PlanEditor = () => {
    const [availableFeatures, setAvailableFeatures] = useState<Feature[]>([
        { featureId: 1, name: 'Storage' },
        { featureId: 2, name: 'Users' },
        { featureId: 3, name: '24/7 Support' },
        { featureId: 4, name: 'Custom Domain' },
    ]);

    const [formData, setFormData] = useState<Plan>({
        planId: 1,
        name: 'Pro Plan',
        price: 29.99,
        description: 'Best for small businesses',
        badge: true,
        isActive: true,
        planFeatures: [
            { featureId: 1, valueType: 'string', value: '50GB' },
            { featureId: 3, valueType: 'boolean', value: 'true' },
        ],
    });

    const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleFeatureChange = (index: number, field: keyof PlanFeature, value: any) => {
        const updatedFeatures = [...formData.planFeatures];
        updatedFeatures[index] = { ...updatedFeatures[index], [field]: value };
        setFormData(prev => ({ ...prev, planFeatures: updatedFeatures }));
    };

    const addFeatureRow = () => {
        setFormData(prev => ({
            ...prev,
            planFeatures: [
                ...prev.planFeatures,
                { featureId: availableFeatures[0].featureId, valueType: 'string', value: '' } // Default row
            ]
        }));
    };

    const removeFeatureRow = (index: number) => {
        const updatedFeatures = formData.planFeatures.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, planFeatures: updatedFeatures }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Payload gửi về API PUT:", JSON.stringify(formData, null, 2));
        alert("Đã lưu! Kiểm tra Console để xem JSON.");
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Chỉnh sửa Gói Dịch Vụ (Plan)</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tên gói</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleBasicChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Giá (USD)</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleBasicChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleBasicChange}
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="flex gap-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            name="badge"
                            checked={formData.badge}
                            onChange={handleBasicChange}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Hiển thị Badge (Hot/Best)</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleBasicChange}
                            className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Đang hoạt động</span>
                    </label>
                </div>

                <hr className="my-6" />

                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Các tính năng của gói</h3>
                        <button
                            type="button"
                            onClick={addFeatureRow}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        >
                            + Thêm tính năng
                        </button>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                        {formData.planFeatures.length === 0 && <p className="text-gray-500 text-sm">Chưa có tính năng nào.</p>}

                        {formData.planFeatures.map((pf, index) => (
                            <div key={index} className="flex flex-col md:flex-row gap-3 mb-3 items-end md:items-center">

                                {/* Chọn Feature */}
                                <div className="flex-1 w-full">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Tên tính năng</label>
                                    <select
                                        value={pf.featureId}
                                        onChange={(e) => handleFeatureChange(index, 'featureId', parseInt(e.target.value))}
                                        className="block w-full border border-gray-300 rounded-md p-2 text-sm"
                                    >
                                        {availableFeatures.map(f => (
                                            <option key={f.featureId} value={f.featureId}>{f.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="w-full md:w-32">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Loại giá trị</label>
                                    <select
                                        value={pf.valueType}
                                        onChange={(e) => handleFeatureChange(index, 'valueType', e.target.value)}
                                        className="block w-full border border-gray-300 rounded-md p-2 text-sm"
                                    >
                                        <option value="string">Text/Số</option>
                                        <option value="boolean">Boolean</option>
                                    </select>
                                </div>

                                <div className="flex-1 w-full">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Giá trị (Value)</label>
                                    {pf.valueType === 'boolean' ? (
                                        <select
                                            value={pf.value}
                                            onChange={(e) => handleFeatureChange(index, 'value', e.target.value)}
                                            className="block w-full border border-gray-300 rounded-md p-2 text-sm"
                                        >
                                            <option value="true">Có (True)</option>
                                            <option value="false">Không (False)</option>
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            value={pf.value}
                                            placeholder="VD: 10GB, Unlimited..."
                                            onChange={(e) => handleFeatureChange(index, 'value', e.target.value)}
                                            className="block w-full border border-gray-300 rounded-md p-2 text-sm"
                                        />
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => removeFeatureRow(index)}
                                    className="text-red-600 hover:text-red-800 font-medium text-sm p-2"
                                >
                                    Xóa
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Hủy</button>
                    <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-md">Lưu thay đổi</button>
                </div>

            </form>
        </div>
    )
}

export default PlanEditor