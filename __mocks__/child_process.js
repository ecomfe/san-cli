/**
 * @file child_process单测mock
 */

exports.execSync = jest.fn(opt => {
    switch(opt) {
        case 'git config --get user.name':
            return 'yyt';
        case 'git config --get user.email':
            return 'yyt@123.com';
    }
});
