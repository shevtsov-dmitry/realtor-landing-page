import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setIsEstateFormVisible } from '../../store/estateFormSlice.js';

export default function EstateManagementForm({ formType, json }) {
    const dispatch = useDispatch();
    const GLOBAL_VALUES = useSelector((state) => state.globalStringValues);
    const SERVER_URL = GLOBAL_VALUES.serverUrl;

    const FORM_TYPES = {
        ADD: 'ADD',
        EDIT: 'EDIT'
    };

    const [estateJson, setEstateJson] = useState(json);
    const [validationMessage, setValidationMessage] = useState('');
    const [mainPictureIdx, setMainPictureIdx] = useState(0);
    const [base64Images, setBase64Images] = useState([]);
    const [notification, setNotification] = useState({ message: '', type: '' });

    useEffect(() => {
        if (notification.message) {
            const timer = setTimeout(() => {
                setNotification({ message: '', type: '' });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification.message]);

    useEffect(() => {
         const handleKeyDown = (event) => {
             if (event.key === 'Escape') {
                 dispatch(setIsEstateFormVisible(false));
             }
         };
         document.addEventListener('keydown', handleKeyDown);
         return () => {
             document.removeEventListener('keydown', handleKeyDown);
         };
     }, []);

    if (formType === FORM_TYPES.EDIT) {
        useEffect(() => {
            async function loadEstateImages() {
                const res = await fetch(
                    `${SERVER_URL}/estates/images/get/by/id/${estateJson.estate.id}`
                );
                const fetchedImagesJson = await res.json();
                const fetchedImages = [];
                fetchedImagesJson.forEach((base64content) => {
                    fetchedImages.push(base64content);
                });
                setBase64Images(fetchedImages);
            }

            loadEstateImages();
        }, []);
    }

    const handleFormInputChange = (e) => {
        let { name, value, type, checked } = e.target;
        const [characteristic, property] = name.split('.');

        if (property) {
            setEstateJson((prev) => ({
                ...prev,
                [characteristic]: {
                    ...prev[characteristic],
                    [property]: type === 'checkbox' ? checked : value
                }
            }));
        }

        validateInputs(characteristic, property, value);
    };

    function validateInputs(characteristic, property, value) {
        const regexOnlyNums = /[^0-9,.]/;
        switch (property) {
            case 'price':
            case 'totalSizeSquareMeters':
            case 'kitchenSizeSquareMeters':
            case 'ceilHeight':
            case 'toiletsAmount':
            case 'roomsAmount':
                setValidationMessage(
                    regexOnlyNums.test(value)
                        ? 'Допустимы только цифры и/или запятая'
                        : ''
                );
                break;
        }


    }

    async function handleFormSubmit(e) {
        e.preventDefault();

        // TODO make performant estate editing instead of recreating it
        // if (formType === FORM_TYPES.ADD) {
        //     saveNewEstate();
        // } else if (formType === FORM_TYPES.EDIT) {
        //     editExistingEstate();
        // }

        if (formType === FORM_TYPES.EDIT) {
            await fetch(
                `${SERVER_URL}/estates/images/delete/by/id/${estateJson.estate.id}`,
                {
                    method: 'DELETE'
                }
            );
        }

        saveNewEstate();

        async function saveNewEstate() {
            const resEstate = await fetch(`${SERVER_URL}/estates/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(estateJson)
            });

            if (!resEstate.ok) {
                displayNotification(
                    resEstate,
                    '',
                    'Ошибка при добавлении новых данных о недвижимости.'
                );
                return;
            }

            const estateId = await resEstate.text();

            const imageFormData = new FormData();
            imageFormData.append('estateId', estateId);
            base64Images.forEach((base64, index) => {
                imageFormData.append(
                    'images',
                    base64ToBlob(base64),
                    `image_${index}.jpg`
                );
            });

            function base64ToBlob(base64, type = 'image/**') {
                // const contentType = 'application/octet-stream';
                // const contentType = 'image/**';
                const byteCharacters = atob(base64); // Remove the prefix (data URL)
                const byteNumbers = new Uint8Array(byteCharacters.length);

                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }

                return new Blob([byteNumbers], { type });
            }

            const resImagesSave = await fetch(
                `${SERVER_URL}/estates/images/save`,
                {
                    method: 'POST',
                    body: imageFormData
                }
            );

            displayNotification(
                resImagesSave,
                'Недвижимость успешно сохранена.',
                'Ошибка при сохранении изображении.'
            );

        }
    }

    // async function editExistingEstate() {
    //     const resEstate = await fetch(`${SERVER_URL}/estates/update`, {
    //         method: 'PUT',
    //         body: JSON.stringify(estateJson),
    //         headers: {
    //             'Content-Type': 'application/json'
    //         }
    //     });
    //
    //     const updatedEstateJson = await resEstate.json();
    //     setEstateJson(updatedEstateJson);
    //     displayNotification(
    //         resEstate,
    //         'Данные о недвижимости успешно обновлены.',
    //         'Ошибка при обновлении данных о недвижимости.'
    //     );
    //
    //     // const resImagesSave = await fetch(
    //     //             `${SERVER_URL}/estates/images/save`,
    //     //             {
    //     //                 method: 'POST',
    //     //                 body: imageFormData
    //     //             }
    //     //         );
    //
    //     location.reload();
    // }

    function displayNotification(responseEntity, sucsMes, errMes) {
        if (responseEntity.status !== 200) {
            setNotification({
                message: errMes,
                type: 'error'
            });
        } else {
            setNotification({
                message: sucsMes,
                type: 'success'
            });
        }
    }

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        const base64array = await convertFilesToBase64Strings(files);
        setBase64Images((prevFiles) => [...prevFiles, ...base64array]);

        function convertFilesToBase64Strings(files) {
            let splitIndex = 0;

            return new Promise((resolve, reject) => {
                const base64Promises = files.map((file) => {
                    return new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => {
                            // The result contains the base64 string
                            resolve(cropReactBase64Part(reader.result));
                        };
                        reader.onerror = () => {
                            reject(
                                new Error(`Could not read file: ${file.name}`)
                            );
                        };
                        reader.readAsDataURL(file); // Read file as a data URL
                    });
                });

                // Wait for all files to be read
                Promise.all(base64Promises).then(resolve).catch(reject);
            });

            function cropReactBase64Part(base64string) {
                if (splitIndex !== 0) {
                    return base64string.substring(splitIndex);
                }

                for (let i = 0; i < base64string.length; i++) {
                    if (base64string[i] === ',') {
                        splitIndex = i + 1;
                        return base64string.substring(splitIndex);
                    }
                }
            }
        }
    };

    const handleRemoveImage = (index) => {
        setBase64Images((prevFiles) => prevFiles.filter((_, i) => i !== index)); // Remove the image at the specified index
    };

    const handleSetMainPictureIdx = (index) => {
        setBase64Images((prevFiles) => {
            const newFiles = [...prevFiles];
            const [mainImage] = newFiles.splice(index, 1);
            newFiles.unshift(mainImage);
            return newFiles;
        });
        setMainPictureIdx(0); // The main picture is now at index 0
    };

    const handleDeleteChosenEstate = async (e) => {
        e.preventDefault();
        await fetch(
            `${SERVER_URL}/estates/delete/by/id/${estateJson.estate.id}`,
            {
                method: 'DELETE'
            }
        );
        await fetch(
            `${SERVER_URL}/estates/images/delete/by/id/${estateJson.estate.id}`,
            {
                method: 'DELETE'
            }
        );
        location.reload();
    };

    // Function to render uploaded images with delete option
    const displayRenderImages = () => {
        return (
            <div className={'grid grid-cols-3 gap-2'}>
                {base64Images.map((base64image, index) => (
                    <div key={index} className="relative inline-block">
                        <img
                            src={`data:image/jpeg;base64,${base64image}`}
                            alt={`upload-${index}`}
                            className="uploaded-image"
                        />
                        <button
                            type="button" // Added type="button" to prevent form submission
                            onClick={() => handleRemoveImage(index)}
                            className="absolute right-0 top-0 scale-90 rounded-full bg-red-500 px-1 text-white"
                            aria-label="Remove image"
                        >
                            &times;
                        </button>
                        <button
                            type="button" // Added type="button" to prevent form submission
                            onClick={() => handleSetMainPictureIdx(index)}
                            className={`absolute right-5 top-0 scale-90 rounded-full px-1 text-white ${mainPictureIdx === index ? 'bg-green-500' : 'bg-gray-300'}`}
                            aria-label="Set as main image"
                        >
                            ✓
                        </button>
                    </div>
                ))}
            </div>
        );
    };

    const RequiredFieldSign = () => {
        return <div className="absolute ml-[-9px] text-sm text-red-500">*</div>;
    };

    return (
        <div className="absolute z-20 flex h-auto w-full justify-center">
            <div
                id="form-holder"
                className={`min-h-4/5 relative w-1/3 rounded-xl bg-white p-5 max-laptop:w-2/3 max-mobile:mx-6 max-mobile:w-full`}
            >
                <button
                    type="button"
                    className="absolute right-2 top-0 text-3xl font-bold"
                    onClick={() => dispatch(setIsEstateFormVisible(false))}
                >
                    &times;
                </button>
                <h1 className={'mb-3 text-2xl font-bold'}>
                    {formType === FORM_TYPES.ADD && 'Добавить'}
                    {formType === FORM_TYPES.EDIT && 'Редактировать'}
                </h1>
                <form id="estate-form" className="flex flex-col gap-2">
                    <div
                        className={'form-attribute-input'}
                        style={{ justifyContent: 'flex-start' }}
                    >
                        <label>Адрес</label>
                        <input
                            type="text"
                            name="estate.address"
                            value={estateJson.estate.address}
                            required={true}
                            onChange={handleFormInputChange}
                            className={'w-[88%]'}
                            placeholder={
                                'г. Воронеж, Ленинский проспект, дом 5Б, 2 подъезд, 38 кабинет'
                            }
                        />
                        {estateJson.estate.address.length === 0 && (
                            <RequiredFieldSign />
                        )}
                    </div>
                    <div className={'flex items-center justify-around gap-1'}>
                        <div className={'form-attribute-input'}>
                            <label>Цена</label>
                            <input
                                type="text"
                                name="estate.price"
                                required={true}
                                value={estateJson.estate.price}
                                onChange={handleFormInputChange}
                                placeholder={'4199000'}
                            />
                            {estateJson.estate.price === '' && (
                                <RequiredFieldSign />
                            )}
                        </div>
                        <div className={'flex items-center gap-2'}>
                            <label>Тип недвижимости</label>
                            <select
                                name="estate.estateType"
                                value={estateJson.estate.estateType}
                                onChange={handleFormInputChange}
                                className={'number-selector'}
                            >
                                {/* FIXME currently there is no default option */}
                                <option value="APARTMENT">Квартира</option>
                                <option value="HOUSE">Дом</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex">
                        <div>
                            <label className="upload-picture-label">
                                Загрузите фотографии недвижимости.{' '}
                                <span className={'text-green-500'}>✓</span> -
                                заглавная картинка.
                            </label>
                            <input
                                type="file"
                                required={true}
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
                                        type="text"
                                        name="innerAttributes.totalSizeSquareMeters"
                                        required={true}
                                        value={
                                            estateJson.innerAttributes
                                                .totalSizeSquareMeters
                                        }
                                        onChange={handleFormInputChange}
                                        placeholder={'57,9'}
                                    />
                                    {estateJson.innerAttributes
                                        .totalSizeSquareMeters.length === 0 && (
                                        <RequiredFieldSign />
                                    )}
                                </div>
                                <div className="form-attribute-input">
                                    <label>Размер кухни (м²)</label>
                                    <input
                                        type="text"
                                        name="innerAttributes.kitchenSizeSquareMeters"
                                        value={
                                            estateJson.innerAttributes
                                                .kitchenSizeSquareMeters
                                        }
                                        onChange={handleFormInputChange}
                                        placeholder={'23,5'}
                                    />
                                </div>
                                <div className="form-attribute-input">
                                    <label>Количество комнат</label>
                                    <input
                                        type="text"
                                        name="innerAttributes.roomsAmount"
                                        required={true}
                                        value={
                                            estateJson.innerAttributes
                                                .roomsAmount
                                        }
                                        onChange={handleFormInputChange}
                                        placeholder={'2'}
                                    />
                                    {estateJson.innerAttributes.roomsAmount
                                        .length === 0 && <RequiredFieldSign />}
                                </div>
                                <div className="form-attribute-input">
                                    <label>Высота потолков (м)</label>
                                    <input
                                        type="text"
                                        name="innerAttributes.ceilHeight"
                                        value={
                                            estateJson.innerAttributes
                                                .ceilHeight
                                        }
                                        onChange={handleFormInputChange}
                                        placeholder={'2,2'}
                                    />
                                </div>
                                <div className="form-attribute-input">
                                    <label>Количество санузлов</label>
                                    <input
                                        type="text"
                                        name="innerAttributes.toiletsAmount"
                                        value={
                                            estateJson.innerAttributes
                                                .toiletsAmount
                                        }
                                        onChange={handleFormInputChange}
                                        placeholder={'1'}
                                    />
                                </div>
                                <div className="form-attribute-checkbox">
                                    <label>Наличие отделки</label>
                                    <input
                                        type="checkbox"
                                        name="innerAttributes.hasFinishing"
                                        checked={
                                            estateJson.innerAttributes
                                                .hasFinishing
                                        }
                                        onChange={handleFormInputChange}
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
                                        value={
                                            estateJson.outerAttributes
                                                .description
                                        }
                                        onChange={handleFormInputChange}
                                        className="focus:shadow-outline min-h-[60px] w-full appearance-none rounded border px-3 py-2 text-sm leading-tight text-gray-700 shadow focus:outline-none"
                                    ></textarea>
                                </div>
                                <div className="flex flex-shrink-0 gap-2">
                                    <div className="flex flex-1 flex-col gap-2">
                                        <div className="selector-holder">
                                            <label>Год сдачи</label>
                                            <select
                                                name="outerAttributes.releaseDate"
                                                value={
                                                    estateJson.outerAttributes
                                                        .releaseDate
                                                }
                                                onChange={handleFormInputChange}
                                                className="number-selector"
                                            >
                                                {[...Array(100).keys()].map(
                                                    (num) => {
                                                        const year =
                                                            new Date().getFullYear() -
                                                            num;
                                                        return (
                                                            <option
                                                                key={year}
                                                                value={year}
                                                            >
                                                                {year}
                                                            </option>
                                                        );
                                                    }
                                                )}
                                            </select>
                                        </div>
                                        <div className="selector-holder flex-1">
                                            <label>Этаж</label>
                                            <select
                                                name="outerAttributes.floor"
                                                value={
                                                    estateJson.outerAttributes
                                                        .floor
                                                }
                                                onChange={handleFormInputChange}
                                                className="floor-selector number-selector"
                                            >
                                                {[...Array(26).keys()].map(
                                                    (num) => (
                                                        <option
                                                            key={num}
                                                            value={num - 1}
                                                        >
                                                            {num - 1}
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        </div>
                                        <div className="selector-holder flex-1">
                                            <label>Всего этажей</label>
                                            <select
                                                name="outerAttributes.allFloors"
                                                value={
                                                    estateJson.outerAttributes
                                                        .allFloors
                                                }
                                                onChange={handleFormInputChange}
                                                className="floor-selector number-selector"
                                            >
                                                {[...Array(25).keys()].map(
                                                    (num) => (
                                                        <option
                                                            key={num + 1}
                                                            value={num + 1}
                                                        >
                                                            {num + 1}
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="form-attribute-checkbox">
                                            <label>Наличие парковки</label>
                                            <input
                                                type="checkbox"
                                                name="outerAttributes.hasParking"
                                                checked={
                                                    estateJson.outerAttributes
                                                        .hasPagking
                                                }
                                                onChange={handleFormInputChange}
                                                className={'checkbox-shift-fix'}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex w-full items-center justify-center">
                        <button
                            className="z-10 w-fit select-none rounded-lg bg-white px-4 pb-2 pt-1 font-ptsans-bold text-2xl transition-all hover:scale-105"
                            style={{
                                boxShadow:
                                    'rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset'
                            }}
                            onClick={handleFormSubmit}
                        >
                            {formType === FORM_TYPES.ADD && 'Сохранить'}
                            {formType === FORM_TYPES.EDIT && 'Обновить'}
                        </button>
                        <div className="absolute flex w-full justify-start pl-5">
                            <p
                                className={
                                    'font-ptsans-bold text-sm text-red-300'
                                }
                            >
                                {validationMessage}
                            </p>
                        </div>
                        <div className="absolute flex w-full justify-end pr-5">
                            <button
                                onClick={handleDeleteChosenEstate}
                                className="text-1xl w-fit select-none rounded-lg bg-red-700 px-2 pb-2 pt-1 font-ptsans-bold text-white transition-all hover:scale-105"
                                style={{
                                    boxShadow:
                                        'rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset'
                                }}
                            >
                                Удалить
                            </button>
                        </div>
                    </div>
                    {notification.message && (
                        <div
                            className={`mt-2 rounded p-2 text-center ${notification.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                        >
                            {notification.message}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
