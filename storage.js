class Storage {
    constructor(key) {
        this.storage_key = key;
        this.data = this.get();
    }

    get() {
        return JSON.parse(localStorage.getItem(this.storage_key) || '{}');
    }

    set(key, val) {
        let set_storage = this.get();
        set_storage[key] = val;

        this.write(set_storage);
    }

    delete(key) {
        let set_storage = this.get();

        if (key in set_storage) {
            delete set_storage[key];
        } else {
            throw new Error(`${key} does not exist in storage (${this.storage_key})`);
        }

        this.write(set_storage);
    }

    write(data) {
        this.data = data;
        localStorage.setItem(this.storage_key, JSON.stringify(data || '{}'));
    }
}