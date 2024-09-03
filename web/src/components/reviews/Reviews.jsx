import { useEffect, useRef, useState } from 'react';
import StarRating from '../common/StarRating';
import { useSelector } from 'react-redux';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";

export default function Reviews() {
    const formHolderRef = useRef();

    const defaultUserData = {
        name: 'имя',
        surnname: 'фамилия',
        reviewText: 'пример текста отзыва',
        stars: 5
    };

    const [reviewsJsonArray, setReviewsJsonArray] = useState([
        defaultUserData,
        defaultUserData,
        defaultUserData
    ]);

    const [idImageMap, setIdImageMap] = useState({})

    const [midIdx, setMidIdx] = useState(1);
    const [maxReviewsFetched, setMaxReviewsFetched] = useState(15);

    const positions = {
        LEFT: midIdx - 1,
        MID: midIdx,
        RIGHT: midIdx + 1
    };

    const [isScrollRight, setIsScrollRight] = useState(false);

    const sliderRef = useRef();

    useEffect(() => {
        if (sliderRef.current) {
            sliderRef.current.scrollLeft = 0;
        }
    }, []);

    const GLOBAL_VALUES = useSelector((state) => state.globalStringValues);

    let scrollDistancePx = 300;

    if (sliderRef.current) {
        scrollDistancePx = sliderRef.current.offsetWidth / 3;
    }

    function switchToPrev() {
        if (midIdx - 1 > 0) setMidIdx(midIdx - 1);
        setIsScrollRight(false);
        if (sliderRef.current) {
            sliderRef.current.scrollLeft -= scrollDistancePx;
        }
    }

    function switchToNext() {
        if (midIdx - 1 < maxReviewsFetched) setMidIdx(midIdx + 1);
        setIsScrollRight(true);
        if (sliderRef.current) {
            sliderRef.current.scrollLeft += scrollDistancePx;
        }
    }

    useEffect(() => {

        fetchUserReviews();

        async function fetchUserReviews() {
            const url =
                GLOBAL_VALUES.serverUrl +
                '/reviews/get/recent/' +
                maxReviewsFetched;
            const req = await fetch(url);
            const res = await req.json();
            setReviewsJsonArray(res);

            fetchUserPictures(res);
        }

        async function fetchUserPictures(jsonArray) {
            // TODO refactor into one fetch
            const ids = []
            jsonArray.forEach(json => {
                ids.push(json["id"])
            });
            const imagesResponce = await fetch(GLOBAL_VALUES.serverUrl + "/reviews/user-pics/get/by-ids", {
                method: "POST",
                body: JSON.stringify(ids),
                headers: {
                    "Content-Type": "application/json"
                }
            })
            const fetchedImagesMap = await imagesResponce.json()
            setIdImageMap(fetchedImagesMap)

        }

    }, [maxReviewsFetched]);

    function ReviewDiv({ positionIdx, json }) {
        const [isShowMore, setIsShowMore] = useState(false);
        const [userPic, setUserPic] = useState(null)
        const reviewDivRef = useRef();

        const isLeft = positionIdx === positions.LEFT;
        const isMid = positionIdx === positions.MID;
        const isRight = positionIdx === positions.RIGHT;

        useEffect(() => {
            setUserPic("data:image/jpeg;base64," + idImageMap[json["id"]])
        }, [])

        useEffect(() => {
            if (isMid) {
                reviewDivRef.current.style.transform = 'scale(1.25)';
                reviewDivRef.current.classList.add('animate-scale-up');
            }
            if (isScrollRight) {
                isLeft &&
                    reviewDivRef.current.classList.add('animate-scale-down');
            }
            if (!isScrollRight) {
                isRight &&
                    reviewDivRef.current.classList.add('animate-scale-down');
            }
        }, [midIdx]);

        return (
            <div className="mx-[3.1665%] w-[27%] flex-shrink-0">
                <div
                    ref={reviewDivRef}
                    // className={`${isMid && 'z-20'} mx-[1.665%] flex h-[20em] w-[30%] flex-shrink-0 flex-col rounded-lg bg-white p-5`}
                    className={
                        `flex h-[20em] flex-col rounded-lg bg-white p-5 ` +
                        ` ${isShowMore && isLeft && 'z-50 h-auto'} ` +
                        ` ${isShowMore && isMid && 'z-50 h-auto'} ` +
                        ` ${isShowMore && isRight && 'z-50 h-auto'} `
                    }
                    style={{
                        boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px'
                    }}
                >
                    <div className="flex items-center gap-2 pb-[2%]">
                        <img
                            id="usr-pic"
                            src={`${userPic !== null ? userPic : "images/reviews/default-user-pic.png"}`}
                            className="w-[12%]"
                        />
                        <div>
                            <h3 id="user-name">
                                {json.name} {json.surname}
                            </h3>
                            <StarRating
                                stars={json.stars}
                                isDefaultChecked={true}
                            />
                        </div>
                    </div>
                    <p className={`overflow-hidden`}>{json.reviewText}</p>
                    <p
                        className={`w-fit select-none py-[2%] font-[0.7rem] underline hover:cursor-pointer hover:text-blue-500`}
                        onClick={() => setIsShowMore(isShowMore ? false : true)}
                    >
                        {isShowMore ? 'закрыть' : 'посмотреть полностью'}
                    </p>
                </div>
            </div>
        );
    }

    function SwitchArrows() {
        return (
            <div className="flex h-12 w-full justify-center">
                <div className="z-50 mt-[-10%] flex items-center gap-5">
                    <FaArrowLeft
                        size={30}
                        className="switch-review-arrow"
                        onClick={() => switchToPrev()}
                    />
                    {/* TODO set here somethin like 1..252 underlined. go from newest requests to oldests */}
                    <p className="select-none text-[2rem] font-bold text-white">
                        {midIdx}
                    </p>
                    <FaArrowRight
                        size={30}
                        className="switch-review-arrow"
                        onClick={() => switchToNext()}
                    />
                </div>
            </div>
        );
    }



    function SaveReviewForm() {
        const [name, setName] = useState('');
        const [surname, setSurname] = useState('');
        const [reviewText, setReviewText] = useState('');
        const [operationStatusMessage, setOperationStatusMessage] =
            useState('');
        const [userPicFile, setUserPic] = useState('');
        const stars = useSelector(state => state.review).stars

        const [isReviewSuccessfullySent, setIsReviewSuccessfullySent] = useState(false);

        useEffect(() => {
            if (!isReviewSuccessfullySent) {
                return
            }
            setMaxReviewsFetched(maxReviewsFetched + 1)
        }, [isReviewSuccessfullySent])

        async function handleFormSubmit(e) {
            // TODO forbid abillity spam multiple reviews
            if (isReviewSuccessfullySent) {
                return;
            }

            e.preventDefault();
            const reviewData = { name, surname, stars, reviewText };

            if (name.length < 2) {
                setOperationStatusMessage("Пожалуйста, укажите своё имя ❌")
                return
            } else if (name.length > 50) {
                setOperationStatusMessage("Слишком длинное имя ❌")
                return
            } else if (surname.length < 2) {
                setOperationStatusMessage("Пожалуйста, укажите свою фамилию ❌")
                return
            } else if (surname.length > 70) {
                setOperationStatusMessage("Слишком длинная фамилия ❌")
                return
            } else if (stars === 0) {
                setOperationStatusMessage("Пожалуйста, оставьте оценку ⭐")
                return
            } else if (reviewText.length < 10) {
                setOperationStatusMessage("Пожалуйста, напишите отзыв (от 3-ёх слов) ❌")
                return
            } else if (reviewText.length > 10000) {
                setOperationStatusMessage("Лимит символов отзыва привышен (10 000) ❌")
                return
            }

            const userReviewRes = await fetch(GLOBAL_VALUES.serverUrl + '/reviews/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reviewData)
            });

            const savedReview = await userReviewRes.json()
            const picSaveRes = userPicFile !== "" && await saveUserPic(savedReview.id)

            const didSaveReview = userReviewRes.status === 200
            const didSaveImageOrDecideNotTo = userPicFile === "" || picSaveRes.status === 200
            setIsReviewSuccessfullySent(didSaveReview && didSaveImageOrDecideNotTo)

            visualizeResponse(isReviewSuccessfullySent);

            function visualizeResponse(statusIsOk) {
                if (statusIsOk) {
                    setOperationStatusMessage(
                        'Благодарим за оставленный отзыв! ✅'
                    );
                } else {
                    setOperationStatusMessage(
                        'Ошибка при добавлении нового отзыва. ❌'
                    );
                }
            }


        }

        async function saveUserPic(reviewId) {
            const formData = new FormData();
            formData.append('reviewId', reviewId);
            formData.append('userPic', userPicFile);

            return await fetch(
                GLOBAL_VALUES.serverUrl + '/reviews/user-pics/save',
                {
                    method: 'POST',
                    body: formData
                }
            );
        }
        useEffect(() => {
            if (formHolderRef.current) {
                formHolderRef.current.style.display = 'none';
            }

        }, []);

        function UserPicCropper() {
            const cropperRef = useRef(null);
            const [userPickedImage, setUserPickedImage] = useState()

            function onCrop() {
                if (!cropperRef.current) {
                    return
                }
                const cropper = cropperRef.current.cropper;
                console.log(cropper.getCroppedCanvas().toDataURL());
            }
            useEffect(() => {
                const reader = new FileReader();
                reader.readAsDataURL(userPicFile)
                reader.onload = () => {
                    setUserPickedImage(reader.result)
                }
            }, [])

            return (
                <Cropper
                    src={userPickedImage}
                    style={{ height: 400, width: "100%" }}
                    initialAspectRatio={4 / 3}
                    guides={false}
                    cropend={onCrop}
                    ref={cropperRef}
                />
            );
        }


        return (
            <div className={'absolute z-50 mt-[8%] w-full justify-center'}>
                <div
                    className="z-50 mx-auto w-1/4 p-4 max-laptop:w-1/3 max-mobile:w-3/4"
                    ref={formHolderRef}
                >
                    <form
                        onSubmit={handleFormSubmit}
                        className="mb-4 rounded-lg bg-white px-10 pb-8 pt-6"
                        style={{
                            boxShadow: 'rgba(0, 0, 0, 0.56) 0px 22px 70px 4px'
                        }}
                    >
                        <div
                            id={'close-sign-holder'}
                            className={'mt-[-1rem] flex justify-end'}
                        >
                            <div
                                id="form-close-sign"
                                className={
                                    'select-none text-right font-mono text-3xl font-bold hover:cursor-pointer'
                                }
                                onClick={() => {
                                    // setIsFormActive(false)
                                    formHolderRef.current.style.display =
                                        'none';
                                }}
                            >
                                X
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="mb-2 block text-sm font-bold text-gray-700">
                                Имя
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="mb-2 block text-sm font-bold text-gray-700">
                                Фамилия
                            </label>
                            <input
                                type="text"
                                value={surname}
                                onChange={(e) => setSurname(e.target.value)}
                                className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="mb-2 block text-sm font-bold text-gray-700">
                                Оценка
                            </label>
                            <StarRating stars={0} isDefaultChecked={false} />
                        </div>
                        <div className="mb-4">
                            <label className="mb-2 block text-sm font-bold text-gray-700">
                                Отзыв
                            </label>
                            <textarea
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                className="focus:shadow-outline min-h-[100px] w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                            ></textarea>
                        </div>
                        <div className="mb-4">
                            <label className="mb-2 block text-sm font-bold text-gray-700">
                                Ваша фотография (к пожеланию)
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setUserPic(e.target.files[0])}
                                className="w-full appearance-none rounded px-3 py-2 leading-tight text-gray-700 hover:cursor-pointer"
                            />
                        </div>
                        {userPicFile.length !== 0 && <UserPicCropper />}
                        <div className="flex items-center justify-center">
                            <button
                                type="submit"
                                className="focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
                            >
                                Оставить отзыв
                            </button>
                            <div className={'absolute mt-[70px]'}>
                                {operationStatusMessage}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`flex h-full flex-col bg-[url('images/reviews/foggy-city.jpg')] bg-cover bg-no-repeat py-[2%]`}
        >
            <div className="h-full w-full flex-1">
                <h1 className="text-center font-ptsans-bold text-5xl">
                    Отзывы тех, кто уже совершил <br /> выгодную сделку с моей
                    помощью
                </h1>
            </div>

            <div className="flex-2 flex h-full w-full flex-col items-center justify-center">
                <div
                    // FIXME add antispam restriction for horizontal scrolling to prevent review position shift
                    ref={sliderRef}
                    className="z-20 flex w-full items-center overflow-hidden scroll-smooth py-[8%] max-mobile:h-full max-mobile:flex-col"
                >
                    {/* TODO decide what to do with confict of empty divs and smooth scrolling */}
                    {/* <div */}
                    {/*     id={'left-empty-space'} */}
                    {/*     className={`${midIdx == 0 ? 'w-1/3' : 'w-0'} flex-shrink-0 transition-all`} */}
                    {/* /> */}
                    {reviewsJsonArray.map((json, idx) => (
                        <ReviewDiv key={idx} json={json} positionIdx={idx} />
                    ))}
                    {/* <div */}
                    {/*     id={'right-empty-space'} */}
                    {/*     className={`w-1/3 flex-shrink-0`} */}
                    {/* /> */}
                </div>

                <SwitchArrows />
            </div>

            <SaveReviewForm />

            <div className="flex w-full flex-1 justify-center">
                <button
                    onClick={() => {
                        formHolderRef.current.style.display = 'block';
                    }}
                    className="w-fit select-none rounded-lg bg-white px-5 pb-4 pt-3 font-ptsans-bold text-3xl transition-all hover:scale-105"
                    style={{
                        boxShadow:
                            'rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset'
                    }}
                >
                    Оставить отзыв
                </button>
            </div>
        </div>
    );


}
