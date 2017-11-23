/// <reference path="../vendors/knockout.d.ts" />

/**
 * Управление просмотром 3д фото.
 * При открытии в слайдере по умолчанию вращение влево.
 * Клик мышкой останавливает вращение, повторный запускает вращение.
 * Если при нажатой кнопке мыши двигать влево или вправо курсор, направление
 * вращения будет меняться. Последующие открытия в слайдере запускают вращение
 * в том направлении, которое было последним.
 */
class Viewer3D {

    el3D:               HTMLElement;
    selector3D:         string;
    selectorSlider:     string;
    imageUrl:           string;
    imageLoaderUrl:     string;
    is3DShow:           KnockoutObservable<boolean>;
    rotating:           boolean;
    sliderHeight:       number;
    speed:              number;
    position:           number;
    timerId:            number;
    rotateStartX:       number;
    imageWidth:         number;
    imageHeight:        number;
    containerWidth:     number;
    containerHeight:    number;
    frameCount:         number;
    limitShift:         number;
    direct:             string;
    isMouseMoved:       boolean;
    wasStopping:        boolean;

    constructor({
                    imageUrl = '',
                    imageLoaderUrl = '/images/loader.gif',
                    selector3D = '.j-3d-photo',
                    selectorSlider = '.product-description__slider-item',
                    speed = 170,
                    frameCount = 36,
                    direct = 'left'
                }) {

        this.selector3D = selector3D;
        this.selectorSlider = selectorSlider;
        this.speed = speed;
        this.frameCount = frameCount;
        this.direct = direct;
        this.imageLoaderUrl = imageLoaderUrl;

        this.position = 0;
        this.rotating = false;
        this.rotateStartX = 0;

        this.el3D = <HTMLElement>document.querySelector(this.selector3D);
        this.el3D.style.backgroundPositionX = "0";

        this.is3DShow = ko.observable(false);

        let image3D = new Image();
        image3D.src = imageUrl;
        image3D.onload = () => {
            this.imageUrl = imageUrl;
            this.imageWidth = image3D.width;
            this.imageHeight = image3D.height;
            if (this.is3DShow()) {
                this.setContainer();
                this.start();
            }
        }
    }

    public show() {
        this.setContainer();
        this.is3DShow(true);
        if (this.imageWidth) {
            this.start();
        }
    }

    public hide() {
        this.el3D.style.backgroundPositionX = "0";
        this.position = 0;
        this.stop();
        this.is3DShow(false);
        this.el3D.removeEventListener('mousedown', this);
    }

    public start() {
        this.timerId = setInterval(() => this.rotate(), this.speed);
        this.rotating = true;
    }

    public stop() {
        if (!this.rotating) this.wasStopping = true;
        clearInterval(this.timerId);
        this.rotating = false;
    }

    private rotate() {
        switch (this.direct) {
            case 'right':
                this.rotateRight();
                break;
            case 'left':
                this.rotateLeft();
        }
    }

    /**
     * В addEventListener передается текущий объект.
     * При возникновении события выполняется this.handleEvent()
     */
    public mouseDown() {
        this.stop();
        document.addEventListener('mousemove', this);
        document.addEventListener('mouseup', this);

    }

    public mouseUp() {
        document.removeEventListener('mousemove', this);
        document.removeEventListener('mouseup', this);
        if (this.isMouseMoved || this.wasStopping) {
            this.start();
            this.isMouseMoved = false;
            this.wasStopping = false;
        }

    }

    public rotateOnMouseMove(event) {
        if (this.rotateStartX > event.pageX) {
            this.direct = 'left';
            this.rotateLeft();
        }
        else if (this.rotateStartX < event.pageX) {
            this.direct = 'right';
            this.rotateRight();
        }
        this.rotateStartX = event.pageX;

    }

    public rotateLeft() {
        this.el3D.style.backgroundPositionX = this.position + 'px';

        if (Math.abs(this.position) < this.limitShift) {
            this.position -= this.containerWidth;
        } else this.position = 0;
    }

    public rotateRight() {
        this.el3D.style.backgroundPositionX = this.position + 'px';

        if (this.position < this.limitShift) {
            this.position += this.containerWidth;
        } else this.position = 0;
    }

    /**
     * Реализация интерфейса EventListener объекта
     * addEventListener получает в качестве параметра текущий объект.
     * Функуция handleEvent выполняется в случае возникновения подписанных событий
     * @param e
     */
    public handleEvent(e) {
        switch (e.type) {
            case 'mousemove':
                this.rotateOnMouseMove(e);
                this.isMouseMoved = true;
                break;
            case 'mouseup':
                this.mouseUp();
                break;
            case 'mousedown':
                this.mouseDown();
                break;
        }
    }

    /**
     * Для различной высоты слайдера высчитывает размеры контейнера в который будет вписано
     * фото 3Д.
     * Главная цель высчитать точную ширину контейнера, от которой зависит точность смещения
     * фото.
     * Затем подгоняется высота.
     */
    setContainer() {
        this.sliderHeight = document.querySelector(this.selectorSlider).clientHeight;

        /**
         * Высота от которой отталкиваемся при расчете
         */
        let baseHeight = this.imageHeight <= this.sliderHeight ?
            this.imageHeight :
            this.sliderHeight;

        let frameWidth = this.imageWidth / this.frameCount;

        /**
         * Отношение высоты и ширины кадра
         */
        let coefficient = this.imageHeight / frameWidth;

        /**
         * Точная ширина
         */
        this.containerWidth = Math.floor(baseHeight / coefficient);

        /**
         * Устанавливаем приблизительную высоту по точной ширине.
         */
        this.containerHeight = this.containerWidth * coefficient;

        this.el3D.style.backgroundSize = `${this.containerWidth * this.frameCount}px`;

        /**
         * Если фото 3д подгрузилось, устанавливаем на фоне. Если нет, то на фоне прелоадер.
         */
        if (this.imageWidth)
        {
            /**
             * Поменять стили одним параметром не удалось.
             */
            this.el3D.style.backgroundPosition = '';
            this.el3D.style.backgroundRepeat = '';
            this.el3D.style.backgroundImage = `url("${this.imageUrl}")`;
            this.el3D.addEventListener('mousedown', this);
        } else {
            this.el3D.style.backgroundImage = `url("${this.imageLoaderUrl}")`;
            this.el3D.style.backgroundPosition = 'center';
            this.el3D.style.backgroundRepeat = 'no-repeat';
        }

        this.el3D.style.width = `${this.containerWidth}px`;
        this.el3D.style.height = `${this.containerHeight}px`;

        this.limitShift = this.containerWidth * (this.frameCount - 1);
    }

}

export default Viewer3D