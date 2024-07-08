const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');

const Playground = require('../models/playgroundModel');
const User = require('../models/userModel');
const { validationResult } = require('express-validator');
const { capitalize } = require('../utils/functions');
const { emitSocketEvent } = require('../scoket/socket');



exports.createPlayground = asyncHandler(async (req, res) => {
    // const validationErrors = validationResult(req);
    // console.log(validationErrors);
    // if (!validationErrors.isEmpty()) {
    //     console.log(validationErrors);
    // }

    const { name, code, language, input, roomId, createdAt } = req.body;
    const createdBy = req.userId;
    const user
        = await User.findById(createdBy);
    if (!user) {
        throw new Error('User not found', 404, { userNotFound: true });
    }

    const room = await Playground.findOne({
        roomId,
    });

    if (room) {
        throw new Error('Room Id is already taken', 400, { roomExists: true });
    }

    const newName = capitalize(name);

    const playground = new Playground({
        name : newName,
        code,
        language,
        input,
        roomId,
        createdBy,
        createdAt,
        isActive: true
    });
    await playground.save();

    res.status(200).json({
        status: 'success',
        message: 'Playground created successfully',
        data: {
            playground
        }
    });

}
);

exports.joinRequest = asyncHandler(async (req, res) => {
    const { roomId } = req.body;
    const userId = req.userId;

    const playground = await Playground.findOne({ roomId });
    if (!playground) {
        throw new Error('Room not found', 404, { roomNotFound: true });
    }

    console.log(playground);
    const owner = playground.createdBy;
    const user = await User.findById(userId);
    const username = user.username;

    // console.log(owner);
    // console.log(userId);

    console.log(playground.participatedUsers);

    if (playground.participatedUsers.includes(userId)) {
        throw new Error('You have already joined this room', 400, { alreadyJoined: true });
    }

    if(owner === userId) {
        throw new Error('You are the creator of this room', 400, { creator: true });
    }

    if(playground.isActive !== true) {
        throw new Error('Room is not active', 400, { roomNotActive: true });
    }

    emitSocketEvent(req,'wantsToJoin', { roomId, username ,ownerId: owner,userId }, owner);

    res.status(200).json({
        status: 'success',
        message: 'Join request sent successfully',
    });

});

exports.approveJoinRequest = asyncHandler(async (req, res) => {
    const { roomId, userId } = req.body;
    const ownerId = req.userId;

    const playground = await Playground.findOne
    ({ roomId });
    console.log(playground);
    if (!playground) {
        throw new Error('Room not found', 404, { roomNotFound: true });
    }

    playground.participatedUsers.push(userId);
    
    await playground.save();

    emitSocketEvent(req,'approveJoinRequest', { roomId, userId }, userId);

    res.status(200).json({
        status: 'success',
        message: 'Join request approved successfully',
    });
    
});

exports.rejectJoinRequest = asyncHandler(async (req, res) => {
    const { roomId, userId } = req.body;
    const ownerId = req.userId;

    emitSocketEvent(req,'rejectJoinRequest', { roomId, userId }, userId);

    res.status(200).json({
        status: 'success',
        message: 'Join request rejected successfully',
    });
    
});


exports.getYourPlaygrounds = asyncHandler(async (req, res) => {
    const userId = req.userId;

    const playgrounds = await Playground.find({ createdBy: userId }).select('-participatedUsers -code -input');

    res.status(200).json({
        status: 'success',
        message: 'Your playgrounds fetched successfully',
        data: {
            playgrounds
        }
    });

}
);

exports.getJoinedPlaygrounds = asyncHandler(async (req, res) => {
    const userId = req.userId;

    const playgrounds = await Playground.find({ participatedUsers: userId }).select('-participatedUsers -code -input ');

    res.status(200).json({
        status: 'success',
        message: 'Your playgrounds fetched successfully',
        data: {
            playgrounds
        }
    });
}
);