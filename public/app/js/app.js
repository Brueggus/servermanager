var app = new Vue({
    el: '#app',
    data: {
      currency: '€',
      billingTerm: 'month',
      // Form values
      hosts: null,
      status: null,
      name: null, 
      hostname: null,
      location: null,
      tags: null,
      ressources: null,
      provider: null,
      ips: null,
      price: null,
      type: null,
      notes: null,
      os: null,
      // State of UI objects
      sidebarOpen: false,
      modalOpen: false,
      addHostOpen: false,
      editHostOpen: false,
      settingsOpen: false,
      // Name of the account to be deleted
      deleteHostName: null,
      // Search bar
      searchQuery: null,
      // 
      pendingEditResponse: true,
      editHost: null,
      hostStatus: [],
      pendingStatus: true
    },
    methods: {
      filterTags(value) {
        return value.split(",");
      },
      toggelDeleteModal(name) {
        this.modalOpen = !this.modalOpen
        this.deleteHostName = name
      },
      deleteServer() {
            var params = new URLSearchParams();
            params.append('name', this.deleteHostName);
            axios.post('http://servermanager.test/api/deleteserver', params)
                .then(response =>{
                    this.getServer()
                })
                .catch(function (error) {
                    console.log(error);
                });
        this.modalOpen = false
        this.deleteHostName = null  
      },
      getServer() {
        axios
        .get('http://servermanager.test/api/listserver')
        .then(response => (
          this.hosts = response.data
        ))
      },
      getStatus(name) {
        this.pendingStatus = false;
        this.hosts.forEach(host => {
          var params = new URLSearchParams();
          params.append('name', host.name);
          axios.post('http://servermanager.test/api/getstatus', params)
              .then(response =>{
                  if(response.data == 1) {
                    this.hostStatus[host.name] = true;
                    return true;
                  }
                  else {
                    this.hostStatus[host.name] = false;
                    return false;
                  }
              })
              .catch(function (error) {
                  console.log(error);
              });
        });
      },
      editServer(name) {
        this.editHostOpen = true;
        this.pendingEditResponse = true

        var params = new URLSearchParams();
        params.append('name', name);
        axios.post('http://servermanager.test/api/showsingle', params)
        .then(response => (
          this.editHost = response.data,
          this.name = response.data.name,
          this.hostname = this.editHost.hostname,
          this.location = this.editHost.location,
          this.tags = this.editHost.tags,
          this.ressources = this.editHost.ressources,
          this.provider = this.editHost.provider,
          this.type = this.editHost.type,
          this.os = this.editHost.os,
          this.ips = this.editHost.ips,
          this.price = this.editHost.price,
          this.notes = this.editHost.notes,
          this.pendingEditResponse = false
          ))
      },
      addServer() {
        if(this.name && this.hostname && this.location) {
          var params = new URLSearchParams();
          params.append('name', this.name);
          params.append('hostname', this.hostname);
          params.append('location', this.location);
          params.append('tags', this.tags);
          params.append('ressources', this.ressources);
          params.append('provider', this.provider);
          params.append('type', this.type);
          params.append('os', this.os);
          params.append('ips', this.ips);
          params.append('price', this.price);
          params.append('notes', this.notes);
          axios.post('http://servermanager.test/api/addserver', params)
          .then(response =>{
              this.getServer();
              this.addHostOpen = false;
              this.editHostOpen = false;
              // window.location.href = '/';
          })
          .catch(function (error) {
              console.log(error);
          });
        }
      }
    },
    computed: {
      filteredHosts() {
        if(this.searchQuery) {
          return this.hosts.filter((host)=>{
            return this.searchQuery.toLowerCase().split(' ').every(v => 
              host.name.toLowerCase().includes(v) || 
              host.hostname.toLowerCase().includes(v) ||
              host.tags.toLowerCase().includes(v) ||
              host.ressources.toLowerCase().includes(v) ||
              host.location.toLowerCase().includes(v) ||
              host.provider.toLowerCase().includes(v) ||
              host.ips.includes(v) ||
              host.type.toLowerCase().includes(v) ||
              host.os.toLowerCase().includes(v))
              //host.price.includes(v))
          })
        } 
        else {
          return this.hosts;
        }
      }
    },
    mounted () {
      this.getServer();
      this.interval = setInterval(() => this.getServer(), 1000);   
      this.getStatus;
      this.interval = setInterval(() => this.getStatus(), 10000);   
    }
  })
