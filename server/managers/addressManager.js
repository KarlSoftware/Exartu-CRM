AddressManager = {
    addEditAddress: function (addr) {
        console.log('addr',addr);
        // Validation
        if (!addr) {
            throw new Error('Address information is required');
        }
        if (addr._id)         Addresses.update({_id: addr._id},addr);
        else Addresses.insert(addr);

    },
    removeAddress: function (id) {
        Addresses.remove({_id: id});
    },
    getAddress: function (contactableid,adddresstype) {
        var addr=Addresses.findOne({linkId:contactableid}); // ignore type check for now
        return addr;
    }

};

