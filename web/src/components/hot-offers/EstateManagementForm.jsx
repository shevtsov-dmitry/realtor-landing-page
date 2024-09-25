import { useEffect, useState } from 'react';

export default function EstateManagementForm(type) {
    const TYPE = {
        ADD: 'ADD',
        EDIT: 'EDIT'
    };

    const [formData, setFormData] = useState({
        estate: {
            address: '',
            estateType: 'APARTMENT',
            price: '',
        },
        innerAttributes: {
            totalSizeSquareMeters: '',
            kitchenSizeSquareMeters: '',
            roomsAmount: '',
            hasFinishing: false,
            ceilHeight: '',
            toiletsAmount: ''
        },
        outerAttributes: {
            hasParking: false,
            description: '',
            releaseDate: '',
            floor: '',
            allFloors: ''
        }
    });

    const [mainPictureIdx, setMainPictureIdx] = useState();
    const [imageFiles, setImageFiles] = useState([]);

    // Function to handle input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name in formData) {
            setFormData((prev) => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        } else {
            const [outerKey, innerKey] = name.split('.');
            setFormData((prev) => ({
                ...prev,
                [outerKey]: {
                    ...prev[outerKey],
                    [innerKey]: type === 'checkbox' ? checked : value
                }
            }));
        }
    };

    function handleSubmit(e) {
        e.preventDefault();

        // Send text data as JSON
        fetch(`${server_url}/some`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        })
            .then(response => response.json())
            .then(data => console.log('Success:', data))
            .catch((error) => console.error('Error:', error));

        // Append images to FormData
        const imageFormData = new FormData();
        imageFiles.forEach(file => {
            imageFormData.append('images', file);
        });

        // Send images as FormData
        fetch(`${server_url}/images`, {
            method: 'POST',
            body: imageFormData,
        })
            .then(response => response.json())
            .then(data => console.log('Images uploaded:', data))
            .catch((error) => console.error('Error uploading images:', error));
    }

    // Function to handle file selection
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setImageFiles((prevFiles) => [...prevFiles, ...files]); // Add new files to the existing array
    };

    // Function to handle file removal
    const handleRemoveImage = (index) => {
        setImageFiles((prevFiles) => prevFiles.filter((_, i) => i !== index)); // Remove the image at the specified index
    };

    // Function to render uploaded images with delete option
    const displayRenderImages = () => {
        return (
            <div className={'grid grid-cols-3 gap-2'}>
                {imageFiles.map((file, index) => (
                    <div key={index} className="relative inline-block">
                        <img
                            src={URL.createObjectURL(file)}
                            alt={`upload-${index}`}
                            className="uploaded-image"
                        />
                        <button
                            onClick={() => handleRemoveImage(index)}
                            className="absolute right-0 top-0 scale-90 rounded-full bg-red-500 px-1 text-white"
                            aria-label="Remove image" >
                            &times;
                        </button>
                        <button
                            onClick={() => setMainPictureIdx(index)}
                            className={`absolute right-5 top-0 scale-90 rounded-full px-1 text-white ${mainPictureIdx === index ? ' bg-green-500' : 'bg-gray-300'}`}
                            aria-label="Set as main image"
                        >
                            ✓
                        </button>
                    </div>
                ))}
            </div>
        );
    };



    return (
        <div className="absolute z-20 flex h-full w-full items-center justify-center">
            <div
                id="form-holder"
                className={`bg-white ${window.height < 1500 ? 'w-1/2' : 'w-1/3'} min-h-4/5 rounded-xl p-5`}
            >
                <form
                    id="estate-form"
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-2"
                >
                    <div className={'form-attribute-input'} style={{ justifyContent: 'flex-start' }}>
                        <label>Адрес</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.estate.address}
                            onChange={handleInputChange}
                            className={'w-[88%]'}
                            placeholder={'г. Воронеж, Ленинский проспект, дом 5Б, 2 подъезд, 38 кабинет'}
                        />
                    </div>
                    <div className={'flex items-center justify-around gap-1'}>
                        <div className={'form-attribute-input'}>
                            <label>Цена</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.estate.price}
                                onChange={handleInputChange}
                                placeholder={'4 199 000'}
                            />
                        </div>
                        <div className={'flex items-center gap-2'}>
                            <label>Тип недвижимости</label>
                            <select
                                name="estateType"
                                value={formData.estate.estateType}
                                onChange={handleInputChange}
                                className={'number-selector'}
                            >
                                <option value="APARTMENT">Квартира</option>
                                <option value="HOUSE">Дом</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex">
                        <div>
                            <label className="upload-picture-label">
                                Загрузите фотографии недвижимости.{' '}
                                <span className={'text-green-500'}>✓</span> - заглавная картинка.
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>
                    <div id="images-pool">{displayRenderImages()}</div>
                    <div className="flex flex-shrink-0 gap-5">
                        <div className="flex-1">
                            <label>Внешние характеристики</label>
                            <hr className={'py-1'} />
                            <div className={'inner-outer-attributes-holder'}>
                                <div className="form-attribute-input">
                                    <label>Размер квартиры (м²)</label>
                                    <input
                                        type="number"
                                        name="innerAttributes.totalSizeSquareMeters"
                                        value={formData.innerAttributes.totalSizeSquareMeters}
                                        onChange={handleInputChange}
                                        placeholder={'57,9'}
                                    />
                                </div>
                                <div className="form-attribute-input">
                                    <label>Размер кухни (м²)</label>
                                    <input
                                        type="number"
                                        name="innerAttributes.kitchenSizeSquareMeters"
                                        value={formData.innerAttributes.kitchenSizeSquareMeters}
                                        onChange={handleInputChange}
                                        placeholder={'23,5'}
                                    />
                                </div>
                                <div className="form-attribute-input">
                                    <label>Количество комнат</label>
                                    <input
                                        type="number"
                                        name="innerAttributes.roomsAmount"
                                        value={formData.innerAttributes.roomsAmount}
                                        onChange={handleInputChange}
                                        placeholder={'2'}
                                    />
                                </div>
                                <div className="form-attribute-input">
                                    <label>Высота потолков (м)</label>
                                    <input
                                        type="number"
                                        name="innerAttributes.ceilHeight"
                                        value={formData.innerAttributes.ceilHeight}
                                        onChange={handleInputChange}
                                        placeholder={'2.2'}
                                    />
                                </div>
                                <div className="form-attribute-input">
                                    <label>Количество санузлов</label>
                                    <input
                                        type="number"
                                        name="innerAttributes.toiletsAmount"
                                        value={formData.innerAttributes.toiletsAmount}
                                        onChange={handleInputChange}
                                        placeholder={'1'}
                                    />
                                </div>
                                <div className="form-attribute-checkbox">
                                    <label>Наличие отделки</label>
                                    <input
                                        type="checkbox"
                                        name="innerAttributes.hasFinishing"
                                        checked={formData.innerAttributes.hasFinishing}
                                        onChange={handleInputChange}
                                        className={'checkbox-shift-fix'}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex-1">
                            <label>Внутренние характеристики</label>
                            <hr className={'py-1'} />
                            <div className={'inner-outer-attributes-holder'}>
                                <div className="form-attribute-input flex-col">
                                    <label>Описание</label>
                                    <textarea
                                        name="outerAttributes.description"
                                        value={formData.outerAttributes.description}
                                        onChange={handleInputChange}
                                        className="focus:shadow-outline min-h-[60px] w-full appearance-none rounded border px-3 py-2 text-sm leading-tight text-gray-700 shadow focus:outline-none"
                                    ></textarea>
                                </div>
                                <div className="flex flex-shrink-0 gap-2">
                                    <div className="flex flex-1 flex-col gap-2">
                                        <div className="selector-holder">
                                            <label>Год сдачи</label>
                                            <select
                                                name="outerAttributes.releaseDate"
                                                value={formData.outerAttributes.releaseDate}
                                                onChange={handleInputChange}
                                                className="number-selector"
                                            >
                                                {[...Array(100).keys()].map((num) => {
                                                    const year = new Date().getFullYear() - num;
                                                    return (
                                                        <option key={year} value={year}>
                                                            {year}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>
                                        <div className="selector-holder flex-1">
                                            <label>Этаж</label>
                                            <select
                                                name="outerAttributes.floor"
                                                value={formData.outerAttributes.floor}
                                                onChange={handleInputChange}
                                                className="floor-selector number-selector"
                                            >
                                                {[...Array(26).keys()].map((num) => (
                                                    <option key={num} value={num - 1}>
                                                        {num - 1}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="selector-holder flex-1">
                                            <label>Всего этажей</label>
                                            <select
                                                name="outerAttributes.allFloors"
                                                value={formData.outerAttributes.allFloors}
                                                onChange={handleInputChange}
                                                className="floor-selector number-selector"
                                            >
                                                {[...Array(25).keys()].map((num) => (
                                                    <option key={num + 1} value={num + 1}>
                                                        {num + 1}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="form-attribute-checkbox">
                                            <label>Наличие парковки</label>
                                            <input
                                                type="checkbox"
                                                name="outerAttributes.hasParking"
                                                checked={formData.outerAttributes.hasParking}
                                                onChange={handleInputChange}
                                                className={'checkbox-shift-fix'}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex w-full justify-center items-center">
                        <button
                            className="w-fit select-none rounded-lg bg-white px-4 pb-2 pt-1 font-ptsans-bold text-2xl transition-all hover:scale-105"
                            style={{
                                boxShadow:
                                    'rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset'
                            }}
                        >
                            Сохранить
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

