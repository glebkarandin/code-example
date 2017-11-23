import {EventEmitter} from 'events'
import layoutStore from '../layout/layout.store'
import api from '../api/api'

class SeoTemplatesStore extends EventEmitter {
    constructor() {
        super();

        /**
         * Модель  для рендера. Запрашивается через getState()
         * @type {Object}
         */
        this.state = {
            filters: {
                url_template: ''
            },
            isLoading: false,
            page: {},
            lastQuery: {}
        };

        this.getData = function(query) {
            this.state.isLoading = true;
            this.emit("change");
            api.seoTemplates().read({query: query}).done((data)=> {
                this.state.page = data;
                this.state.isLoading = false;
                this.emit("change");
            })
        }
    }

    /**
     * При смене состояния пагинатора данный метод делает новый запрос
     * @param {Object} query
     */
    updatePaginatorState(query) {
        if (query) this.state.lastQuery = query;
        this.getData(this.state.lastQuery);
    }

    /**
     * Обновляет список шаблонов после добавления, редактирования, удаления
     */
    updateList() {
        this.updatePaginatorState(this.lastQuery);
    }

    getState() {
        return this.state;
    }

    /**
     * Поиск по строке шаблона
     * @param event
     */
    changeUrlTemplate(event) {
        if(event.charCode == 13 || event.type == 'change'){
            this.state.filters.url_template = event.target.value;
            this.getData({search: this.state.filters});
        }
    }

    refreshCache() {
        api.seoRefreshUrls().delete().done(() => {
            layoutStore.notify('Кэш успешно обновлен', 'success')
        });
    }
}

export default new SeoTemplatesStore()
