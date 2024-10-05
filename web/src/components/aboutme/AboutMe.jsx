import { Fade } from 'react-awesome-reveal';

export default function AboutMe() {
    return (
        <div className="bg-[#E9E7E7] px-[5%] py-[5%]">
            <div className="flex items-center gap-12">
                <div className="flex flex-[2] flex-col">
                    <Fade>
                        <h1 className="mb-[3%] font-ptsans-bold text-4xl max-laptop:text-2xl">
                            Уже 10 лет я помогаю продавать квартиры в Воронеже
                        </h1>
                    </Fade>

                    <Fade
                        cascade
                        className="flex text-2xl max-laptop:text-[1rem]"
                    >
                        <p>
                            Я опытный риелтор с многолетним стажем,
                            специализирующийся на продаже недвижимости.
                            Благодаря моему опыту и знаниям, я помогаю клиентам
                            успешно решать сложные задачи и находить оптимальные
                            варианты для покупки или продажи жилья.
                        </p>
                        <p>
                            За годы работы я приобрёл бесценный опыт и наладил
                            прочные связи с коллегами, агентствами и
                            застройщиками. Это позволяет мне быстро находить
                            подходящие объекты, соответствующие требованиям и
                            пожеланиям клиентов, а также предоставлять им
                            профессиональные консультации на всех этапах
                            сделки.Я умею слушать и понимать потребности своих
                            клиентов, всегда готов предложить альтернативные
                            варианты и найти компромиссное решение.
                        </p>
                        <p>
                            Моя главная цель — обеспечить максимальный комфорт и
                            удовлетворение потребностей клиентов, предоставляя
                            им качественные услуги и индивидуальный подход.Я
                            постоянно совершенствую свои навыки и слежу за
                            изменениями на рынке недвижимости, чтобы быть в
                            курсе последних тенденций и предложений. Это
                            помогает мне предлагать своим клиентам самые
                            выгодные условия и находить лучшие варианты для
                            инвестиций.
                        </p>
                        <p>
                            Я горжусь своей репутацией и стремлюсь продолжать
                            развиваться, чтобы стать ещё более успешным
                            риелтором и помогать большему количеству людей. Если
                            вы ищете надёжного помощника в сфере недвижимости,
                            обращайтесь ко мне, и я с радостью предложу вам свои
                            услуги.
                        </p>
                    </Fade>
                </div>
                <div className="flex flex-1 justify-end">
                    <img
                        src="images/aboutme/realtor-picture.jpg"
                        alt="Фотография Натальи"
                        className="h-fit"
                    />
                </div>
            </div>
        </div>
    );
}
