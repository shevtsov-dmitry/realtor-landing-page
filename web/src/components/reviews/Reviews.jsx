import { useRef, useState, useEffect } from 'react';
import StarRating from '../common/StarRating';
import { useSelector } from 'react-redux';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

export default function Reviews() {
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

    const [midReviewIdx, setMidReviewIdx] = useState(1);

    const positions = {
        LEFT: midReviewIdx - 1,
        MID: midReviewIdx,
        RIGHT: midReviewIdx + 1
    };

    const GLOBAL_VALUES = useSelector((state) => state.globalStringValues);

    useEffect(() => {
        async function fetchUserReviews() {
            const url = GLOBAL_VALUES.serverUrl + '/reviews/list/recent/' + 15;
            const req = await fetch(url);
            const res = await req.json();
            setReviewsJsonArray(res);
        }

        fetchUserReviews();
    }, []);

    function ReviewDiv({ positionIdx, json }) {
        const [isShowMore, setIsShowMore] = useState(false);

        const isMid = positionIdx === positions.MID;

        const [divHeight, setDivHeight] = useState('h-auto');

        useEffect(() => {
            let height = '';
            if (isMid) {
                height = isShowMore ? 'h-auto' : 'h-80';
            } else {
                height = isShowMore ? 'h-auto' : 'h-52';
                console.log(height);
            }
            setDivHeight(height);
        }, [isShowMore]);

        return (
            <div
                // className={`flex w-full flex-col gap-3 rounded bg-white px-[1.5%] py-[1%] ${isMid ? 'h-80' : 'h-52'} ${isShowMore ? 'h-[1000px]' : 'h-[20px]'}`}
                className={`${divHeight} ${isShowMore && 'max-h-92'} flex w-full flex-col gap-3 rounded bg-white px-[1.5%] py-[1%]`}
                style={{
                    boxShadow: 'rgba(0, 0, 0, 0.56) 0px 22px 70px 4px'
                }}
            >
                <div className="flex items-center gap-2">
                    <img
                        id="usr-pic"
                        src={`images/reviews/default-user-pic.png`}
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
                <p className="overflow-hidden">{json.reviewText}</p>
                <p
                    className={`w-fit font-[0.7rem] underline hover:cursor-pointer hover:text-blue-500`}
                    onClick={() => setIsShowMore(isShowMore ? false : true)}
                >
                    {isShowMore ? 'закрыть' : 'посмотреть полностью'}
                </p>
            </div>
        );
    }

    return (
        <div
            className={`flex h-full flex-col gap-24 bg-[url('images/reviews/foggy-city.jpg')] bg-center bg-no-repeat px-[6%] py-[2%]`}
        >
            <div className="h-full w-full flex-1">
                <h1 className="text-center font-ptsans-bold text-4xl">
                    Отзывы тех, кто уже совершил <br /> выгодную сделку с моей
                    помощью
                </h1>
            </div>
            <div className="flex-2 flex w-full flex-col items-center">
                <div className="flex items-center gap-5 max-mobile:flex-col">
                    <ReviewDiv
                        positionIdx={positions.LEFT}
                        json={reviewsJsonArray[positions.LEFT]}
                    />
                    <ReviewDiv
                        positionIdx={positions.MID}
                        json={reviewsJsonArray[positions.MID]}
                    />
                    <ReviewDiv
                        positionIdx={positions.RIGHT}
                        json={reviewsJsonArray[positions.RIGHT]}
                    />
                </div>
                <div>
                    <div className="absolute flex items-center gap-5">
                        <FaArrowLeft
                            size={30}
                            className="switch-review-arrow"
                        />
                        <p className="text-[2rem] font-bold text-white">0</p>
                        <FaArrowRight
                            size={30}
                            className="switch-review-arrow"
                        />
                    </div>
                </div>
            </div>
            <div className="flex w-full flex-1 justify-center">
                <button
                    className="w-fit rounded-lg bg-white px-5 pb-4 pt-3 font-ptsans-bold text-3xl transition-all hover:scale-105"
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
