import { EventEmitter } from 'events'
import api from '../api/api'
import layoutStore from '../layout/layout.store'

class SeoTemplateItemStore extends EventEmitter {
    constructor() {
        super();

        /**
         * Модель  для рендера. Запрашивается через getState()
         * @type {Object}
         */
        this.state = {
            modalShow: false,
            isLoading: false,
            isNew: false,
            confirmDelete: {
                modalShow: false,
                id: ''
            },
            updateList: function () {},
            templateFields: [
                {name: 'url_template', value: '', req: true},
                {name: 'priority', value: '', req: false},
                {name: 'meta_keywords', value: '', req: false},
                {name: 'meta_description', value: '', req: false},
                {name: 'title', value: '', req: false},
                {name: 'h1', value: '', req: false},
                {name: 'seo_text', value: '', req: false},
                {name: '_id', value: '', req: false, disabled: true}
            ]
        };
    }

    getState() {
        return this.state;
    }

    /**
     * Заполнение массива templateFields из результата запроса к API для выбранного шаблона
     * @param fields
     * @param values
     */
    serializeToFields(fields, values) {
        return fields.map((item) => {
            let value = {};
            for (let key in values) {
                if (item.name === key) {
                    value['value'] = values[key];
                }
            }
            return Object.assign({}, item, value);
        })
    }

    /**
     * Заполнение полей для запроса к API
     * @param fields
     */
    serializeToAPI(fields) {
        let query = {};
        fields.forEach((item) => {
            query[item.name] = item.value;
        });
        return query;
    }

    /**
     * Очистка поля value в templateFields перед созданием нового шаблона.
     * Требуется если перед этим радектировался существующий шаблон.
     * @param fields
     */
    clearFields(fields) {
        return Array.isArray(fields) && fields.map((item) => {
            return Object.assign(item, {value: ''});
        })
    }

    getItem(id) {
        this.state.isLoading = true;
        this.emit("change");
        api.seoTemplates().read({id: id}).done((data)=> {
            this.state.templateFields = this.serializeToFields(this.state.templateFields, data);
            this.state.isLoading = false;
            this.emit("change");
        })
    }

    /**
     * Открытие формы создания
     */
    newItem() {
        this.state.modalShow = true;
        this.state.isNew = true;
        this.state.templateFields = this.clearFields(this.state.templateFields);
        this.emit('change');
    }

    /**
     * Открытие формы редактирования
     * @param id
     */
    editItem(id) {
        this.state.modalShow = true;
        this.state.isNew = false;
        this.getItem(id);
    }

    addItem() {
        let query = this.serializeToAPI(this.state.templateFields);
        api.seoTemplates().create(query).done(() => {
            this.resultOk();
        });
    }

    updateItem() {
        let query = this.serializeToAPI(this.state.templateFields);
        api.seoTemplates().update(query).done(() => {
            this.resultOk();
        });
    }

    resultOk() {
        this.state.modalShow = false;
        this.emit('change');
        this.state.updateList();
    }

    /**
     * Отрытие окна подтверждения удаления
     * @param id
     */
    confirmDelete(id) {
        this.state.confirmDelete = {
            modalShow: true,
            id: id
        };
        this.emit('change');
    }

    deleteItem() {
        api.seoTemplates().delete(this.state.confirmDelete.id).done(() => {
            layoutStore.notify('Шаблон успешно удален', 'success');
            this.state.updateList();
            this.state.confirmDelete = {modalShow: false, id: ''};
            this.emit('change');
        });
    }

    /**
     * Функция обновляющая список шаблонов, которая будет выполнена после создания, редактирования, удаления шаблона.
     * @param callback
     */
    setUpdateList(callback) {
        if (typeof callback === 'function') this.state.updateList = callback;
    }

    /**
     * Синхронизирует поля формы и state
     * @param field
     */
    updateField(field) {
        this.state.templateFields = this.serializeToFields(this.state.templateFields, {[field.name]: field.value});
        this.emit('change');
    }

    modalToggle() {
        this.state.modalShow ? this.state.modalShow = false : this.state.modalShow = true;
        this.emit('change');
    }

    modalConfirmDeleteToggle() {
        this.state.confirmDelete.modalShow ? this.state.confirmDelete.modalShow = false : this.state.confirmDelete.modalShow = true;
        this.emit('change');
    }
}

export default new SeoTemplateItemStore()
