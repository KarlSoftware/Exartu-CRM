AddressManager = {
    addEditAddress: function (addr) {

        // Validation
        if (!addr) {
            throw new Error('Address information is required');
        }
        if (addr._id){
            Addresses.update(addr._id, addr);
            return addr._id;
        }
        else
            return Addresses.insert(addr);
    },
    removeAddress: function (id) {
        Addresses.remove({_id: id});
    },
    getAddress: function (contactableid, addresstype) {
        var addr = Addresses.findOne({linkId:contactableid}); // ignore type check for now
        return addr;
    }
};

