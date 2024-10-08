import { useState } from 'react';
import { useSelector } from 'react-redux';
import { FaBars, FaWindowClose } from 'react-icons/fa';
import Navigation from './Navigation';

export default function Navbar() {
    const GLOBAL_VALUES = useSelector((state) => state.globalStringValues);
    const [heightCSS, setHeightCSS] = useState('h-12');
    const [isBurgerOpened, setIsBurgerOpened] = useState(false);

    function SocialMediaIcons() {
        return (
            <div
                id="icons-holder"
                className={`${heightCSS} ${isBurgerOpened ? 'max-laptop:flex' : 'max-laptop:hidden'} flex w-fit gap-7 max-laptop:flex-col max-laptop:gap-5`}
            >
                <a href={GLOBAL_VALUES.telegram} className="h-full w-full">
                    <img
                        src="images/navbar/telegram.png"
                        className="icon"
                        alt="telegram"
                    />
                </a>

                <a href={GLOBAL_VALUES.viber} className="h-full w-full">
                    <img
                        src="images/navbar/viber.png"
                        className="icon"
                        alt="viber"
                    />
                </a>

                <a href={GLOBAL_VALUES.vk} className="h-full w-full">
                    <img src="images/navbar/vk.png" className="icon" alt="vk" />
                </a>

                <a href={GLOBAL_VALUES.whatsapp} className="h-full w-full">
                    <img
                        src="images/navbar/whatsapp.png"
                        className="icon"
                        alt="whatsapp"
                    />
                </a>
            </div>
        );
    }

    function PhoneNumber() {
        return (
            <div id="phone-number-holder" className="mb-[-3px]">
                <u className="phone-number-ul">
                    <p
                        className="phone-number-p text-nowrap text-sm"
                        onClick={(el) => {
                            navigator.clipboard.writeText(
                                el.currentTarget.textContent
                            );
                        }}
                    >
                        {GLOBAL_VALUES.phoneNumber}
                    </p>
                </u>
            </div>
        );
    }

    return (
        <div className="flex w-full justify-center">
            <div
                className={`${heightCSS} absolute z-10 mt-[1%] flex w-[90%] justify-between`}
            >
                <div className="mt-[0.15rem]">
                    <Navigation textSize={'text-3xl'} font={'font-jost'} />
                </div>
                <div
                    id="phone-num-and-icons-holder"
                    className="flex items-center gap-7 max-laptop:gap-5"
                >
                    <PhoneNumber />

                    {isBurgerOpened ? (
                        <FaWindowClose
                            size={25}
                            className="hidden text-white max-laptop:block"
                            onClick={() => setIsBurgerOpened(false)}
                        />
                    ) : (
                        <FaBars
                            size={25}
                            className="hidden text-white hover:cursor-pointer max-laptop:block"
                            onClick={() => setIsBurgerOpened(true)}
                        />
                    )}
                    <SocialMediaIcons heightCSS={heightCSS} />
                </div>
            </div>
        </div>
    );
}
