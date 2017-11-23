
/**
 * Управление картинками в карточке товара в каталоге.
 * После ajax запроса получает адреса первой, второй фото и фото манекена-невидимки.
 * Возвращает первую и вторую фото,
 * в зависимости от параметров showDummySwitch и dummyPosition.
 */
export class ViewerImageCatalog {

    showDummySwitch:    boolean;
    dummyPosition:      number;
    first:              string;
    second:             string;
    dummyView:          KnockoutObservable<boolean>;

    readonly DUMMY_FIRST = 0;
    readonly DUMMY_SECOND = 1;
    readonly DUMMY_LAST = 2;

    constructor() {
        //Инициализация параметров при первоначальном серверном рендеренге
        let dummy = window["params"] && window["params"].dummy;
        this.showDummySwitch = !!dummy && dummy.showDummySwitch;
        this.dummyPosition = dummy ? dummy.dummyPosition : this.DUMMY_LAST;

        //Если фоно неведимки должно стоять первым, отображается кнопка "На модели".
        this.dummyView = ko.observable(this.dummyPosition == this.DUMMY_FIRST);
    }

    getImages() {
        return {
            "img1": this.first,
            "img2": this.second
        }
    }

    /**
     * Инициализация или обновление параметров после ajax-запроса
     * @param {boolean} showDummySwitch
     * @param {number} dummyPosition
     */
    setDummyParamsFromAjax(showDummySwitch = false, dummyPosition = this.DUMMY_LAST) {
        this.showDummySwitch = showDummySwitch;
        this.dummyPosition = dummyPosition;
    }

    /**
     *
     * @param {string} first Основная отография
     * @param {string} second Вторая фотография (отображается по ховеру)
     * @param {string} dummy Фотография на манекене неведимке
     */
    setImagesFromAjax({first = '/images/default-image.jpg', second = '', dummy = ''}:
            {first: string, second: string, dummy: string}) {

        //Логика определения очередности фотографий для рендера после ajax-запроса
        //Дублирующая логика для рендера на сервере здесь - resources\views\catalog\catalog-card.blade.php
        if (!this.showDummySwitch ||
            !dummy ||
            this.DUMMY_LAST == this.dummyPosition)
        {
            this.first = first;
            this.second = second || first;
        } else
        if (this.DUMMY_FIRST == this.dummyPosition)
        {
            this.first = dummy;
            this.second = first;
        } else
        if (this.DUMMY_SECOND == this.dummyPosition)
        {
            this.first = first;
            this.second = dummy;
        }

        //Меняем местами в зависимости от состояния кнопки. На момент ajax-загрузки
        //кнопка может быть переключена.
        //Для DUMMY_FIRST перемена происходит для обратных состояний кнопок.
        if (dummy && (
            (this.dummyView() && this.dummyPosition != this.DUMMY_FIRST) ||
            (!this.dummyView() && this.dummyPosition == this.DUMMY_FIRST))
        )
        {
            let temp = this.first;

            if (this.DUMMY_LAST == this.dummyPosition)
                this.first = dummy;
            else
                this.first = this.second;

            this.second = temp;
        }
    }

    /**
     * Переключение первой и второй фотографии в зависимости от параметров dummyPosition.
     * и наличия фотографии манекена-невидимки.
     */
    switchImages() {
        let els = document.querySelectorAll('[data-lazy-image-hover]');

        [].forEach.call(els, (el) => {
            let dummy = el['dataset']['imageDummy'];
            if (!dummy) return;

            let second;

            //Если DUMMY_LAST и отображаются фото на модели,
            //то первоначально адрес берем из data-image-dummy, так-как на этот момент
            //first это основное фото, а second - фото со спины.
            //В дальнейшем, переключение происходит между основным фото и манекеном
            if (this.dummyPosition == this.DUMMY_LAST && !this.dummyView()) {
                second = dummy;
            } else {
                second = el['dataset']['lazyImageHover'];
            }

            let first = el.parentNode.querySelector('[data-lazy-image]');
            if (first) {
                el['dataset']['lazyImageHover'] = first['dataset']['lazyImage'];
                first['dataset']['lazyImage'] = second;
            }
        });

        this.dummyView(!this.dummyView())
    }
}
