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

    const [midIdx, setMidIdx] = useState(1);

    const positions = {
        LEFT: midIdx - 1,
        MID: midIdx,
        RIGHT: midIdx + 1
    };

    const sliderRef = useRef();

    useEffect(() => {
      if(sliderRef.current) {
        sliderRef.current.scrollLeft = 0
      }
    },[])

    const GLOBAL_VALUES = useSelector((state) => state.globalStringValues);

    let scrollDistancePx = 300;

    if (sliderRef.current) {
        scrollDistancePx = sliderRef.current.offsetWidth / 3;
    }

    function switchToPrev() {
        setMidIdx(midIdx - 1);
        // setIsScrollRight(false);
        if (sliderRef.current) {
            sliderRef.current.scrollLeft -= scrollDistancePx;
        }
    }

    function switchToNext() {
        setMidIdx(midIdx + 1);
        // setIsScrollRight(true);
        if (sliderRef.current) {
          console.log("before",sliderRef.current.scrollLeft)
            sliderRef.current.scrollLeft += scrollDistancePx;
            console.log("after",sliderRef.current.scrollLeft)
        }
    }

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
        const midElRef = useRef()

        useEffect(() => {
          if (positionIdx === positions.MID) {
            midElRef.current.style.transform = "scale(1.25)"
            midElRef.current.classList.add("animate-scale-up")
          }
        }, [midIdx])

        return (
            <div
                ref={midElRef}
                className={`mx-[1.5%] h-[20em] w-[30%] flex-shrink-0 flex flex-col p-5 bg-white rounded-lg`}
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
                    className={`w-fit select-none font-[0.7rem] underline hover:cursor-pointer hover:text-blue-500 py-[5%]`}
                    onClick={() => setIsShowMore(isShowMore ? false : true)}
                >
                  {isShowMore ?  'закрыть' : 'посмотреть полностью' }
                </p>
            </div>
        );
    }

    function SwitchArrows () {

      return (
      <div className="flex w-full justify-center">
          <div className="flex items-center gap-5 z-50 bg-pink-400">
              <FaArrowLeft
                  size={30}
                  className="switch-review-arrow"
                  onClick={() => switchToPrev()}
              />
              <p className="select-none text-[2rem] font-bold text-white">
                  1
              </p>
              <FaArrowRight
                  size={30}
                  className="switch-review-arrow"
                  onClick={ () => switchToNext()}
              />
          </div>
      </div>
      )
    }

    return (
        <div
            className={`flex h-full flex-col bg-[url('images/reviews/foggy-city.jpg')] bg-center bg-no-repeat py-[2%]`}
        >
            <div className="h-full w-full flex-1">
                <h1 className="text-center font-ptsans-bold text-4xl">
                    Отзывы тех, кто уже совершил <br /> выгодную сделку с моей
                    помощью
                </h1>
            </div>
            <div className="flex-2 flex h-full w-full flex-col items-center justify-center">
                <div
                    ref={sliderRef}
                    className="flex z-20 max-mobile:h-full max-mobile:flex-col items-center w-full scroll-smooth overflow-hidden py-[10%]"
                >
                    {reviewsJsonArray.map((json, idx) => (
                        <ReviewDiv key={idx} json={json} positionIdx={idx} />
                    ))}
                </div>
                  <SwitchArrows />
            </div>
            <div className="flex w-full flex-1 justify-center">
                <button
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
