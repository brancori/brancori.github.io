class Organigrama {
    constructor() {
        this.nodes = [];
        this.init();
    }

    init() {
        // Inicializar eventos
        document.getElementById('addNodeBtn').addEventListener('click', () => this.showModal());
        document.querySelector('.close-btn').addEventListener('click', () => this.hideModal());
        document.getElementById('nodeForm').addEventListener('submit', (e) => this.handleSubmit(e));
        document.getElementById('exportBtn').addEventListener('click', () => this.exportOrganigrama());

        // Cargar datos existentes
        this.loadData();
    }

    showModal(nodeData = null) {
        const modal = document.getElementById('nodeModal');
        const form = document.getElementById('nodeForm');
        
        if (nodeData) {
            // Modo edición
            form.querySelector('#nodeName').value = nodeData.name;
            form.querySelector('#nodePosition').value = nodeData.position;
            form.querySelector('#nodeParent').value = nodeData.parentId || '';
        } else {
            // Modo nuevo nodo
            form.reset();
        }

        this.updateParentSelect();
        modal.style.display = 'block';
    }

    hideModal() {
        document.getElementById('nodeModal').style.display = 'none';
    }

    updateParentSelect() {
        const select = document.getElementById('nodeParent');
        select.innerHTML = '<option value="">Ninguno (Nodo Raíz)</option>';
        
        this.nodes.forEach(node => {
            const option = document.createElement('option');
            option.value = node.id;
            option.textContent = node.name;
            select.appendChild(option);
        });
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('nodeName').value,
            position: document.getElementById('nodePosition').value,
            parentId: document.getElementById('nodeParent').value,
            id: Date.now().toString()
        };

        this.addNode(formData);
        this.hideModal();
        this.renderOrganigrama();
        this.saveData();
    }

    addNode(nodeData) {
        this.nodes.push(nodeData);
    }

    renderOrganigrama() {
        const container = document.getElementById('orgChart');
        container.innerHTML = '';

        // Encontrar nodos raíz
        const rootNodes = this.nodes.filter(node => !node.parentId);
        
        rootNodes.forEach(node => {
            const nodeElement = this.createNodeElement(node);
            container.appendChild(nodeElement);
            this.renderChildren(node, nodeElement);
        });
    }

    createNodeElement(node) {
        const div = document.createElement('div');
        div.className = 'org-node';
        div.innerHTML = `
            <div class="org-node-title">${node.name}</div>
            <div class="org-node-position">${node.position}</div>
        `;
        return div;
    }

    renderChildren(parentNode, parentElement) {
        const children = this.nodes.filter(node => node.parentId === parentNode.id);
        
        if (children.length > 0) {
            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'org-children';
            
            children.forEach(child => {
                const childElement = this.createNodeElement(child);
                childrenContainer.appendChild(childElement);
                this.renderChildren(child, childElement);
            });

            parentElement.appendChild(childrenContainer);
        }
    }

    saveData() {
        localStorage.setItem('organigramaData', JSON.stringify(this.nodes));
    }

    loadData() {
        const saved = localStorage.getItem('organigramaData');
        if (saved) {
            this.nodes = JSON.parse(saved);
            this.renderOrganigrama();
        }
    }

    exportOrganigrama() {
        const data = {
            nodes: this.nodes,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'organigrama.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new Organigrama();
});
