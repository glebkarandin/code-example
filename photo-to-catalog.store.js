import { EventEmitter } from 'events'
import api from '../api/api'
import layoutStore from '../layout/layout.store'

class PhotoToCatalogStore extends EventEmitter {
    constructor() {
        super();

        this.state = {
            isLoading: true,
            modalConfirm: false,
            checkboxDisabled: true,
            templates: [],
            config: {}
        }
    }

    getState() {
        return this.state;
    }

    setTemplates(value, target) {
        if (target.name) {
            this.state.checkboxDisabled = true;
            this.state.templates.forEach((item) => {
                if (item.key === target.name) item.active = value;
                this.state.checkboxDisabled = !(item.active || !this.state.checkboxDisabled);
            });

            if (this.state.checkboxDisabled) {
                this.state.config.allow_dummy_in_catalog = false;
                this.state.config.allow_catalog_switch = false;
            }

            this.emit('change');
        }
    }

    setConfig(value, target) {
        if (target.name) {
            this.state.config[target.name] = value;
        }
    }

    getData() {
        this.getTemplates();
        this.getConfig();
    }

    getTemplates() {
        api.imagesTemplates().read()
            .done((data)=> {
            if (Array.isArray(data)) {
                this.state.templates = data;
                this.state.templates.forEach((item) => {
                    this.state.checkboxDisabled = !(item.active || !this.state.checkboxDisabled);
                });
                this.state.isLoading = false;
                this.emit("change");
            }
        })
    }

    getConfig() {
        api.imagesConfig().read()
            .done((data) => {
                this.state.config = data;
                this.emit("change");
            })
    }

    onSave() {
        this.state.modalConfirm = true;
        this.emit('change');
    }

    saveData() {
        this.state.modalConfirm = false;
        this.emit('change');
        this.saveTemplates();
    }

    saveTemplates() {
        api.imagesTemplates().update(this.state.templates)
            .done(() => {
                layoutStore.notify('Шаблоны успешно сохранены', 'success');
                this.saveConfig();
            })
    }

    saveConfig() {
        api.imagesConfig().update(this.state.config)
            .done(() => {
                layoutStore.notify('Конфиг успешно сохранен', 'success');
            })
    }

    modalConfirmToggle() {
        this.state.modalConfirm = !this.state.modalConfirm;
        this.emit('change');
    }
}

export default new PhotoToCatalogStore();
