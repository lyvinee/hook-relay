
import { Test, TestingModule } from '@nestjs/testing';
import { HttpExceptionFilter } from './http-exception.filter';
import { HttpException, HttpStatus, ArgumentsHost } from '@nestjs/common';
import { Request, Response } from 'express';

describe('HttpExceptionFilter', () => {
    let filter: HttpExceptionFilter;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [HttpExceptionFilter],
        }).compile();

        filter = module.get<HttpExceptionFilter>(HttpExceptionFilter);
    });

    it('should be defined', () => {
        expect(filter).toBeDefined();
    });

    it('should catch HttpException and format response', () => {
        const mockJson = jest.fn();
        const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        const mockGetResponse = jest.fn().mockReturnValue({ status: mockStatus });
        const mockGetRequest = jest.fn().mockReturnValue({ url: '/test-url' });
        const mockSwitchToHttp = jest.fn().mockReturnValue({
            getResponse: mockGetResponse,
            getRequest: mockGetRequest,
        });
        const mockHost = {
            switchToHttp: mockSwitchToHttp,
        } as unknown as ArgumentsHost;

        const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

        filter.catch(exception, mockHost);

        expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
            statusCode: HttpStatus.BAD_REQUEST,
            path: '/test-url',
            message: 'Test error',
            error: 'HttpException'
        }));
    });

    it('should catch unknown Error and return 500', () => {
        const mockJson = jest.fn();
        const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        const mockGetResponse = jest.fn().mockReturnValue({ status: mockStatus });
        const mockGetRequest = jest.fn().mockReturnValue({ url: '/test-url' });
        const mockSwitchToHttp = jest.fn().mockReturnValue({
            getResponse: mockGetResponse,
            getRequest: mockGetRequest,
        });
        const mockHost = {
            switchToHttp: mockSwitchToHttp,
        } as unknown as ArgumentsHost;

        const exception = new Error('Unknown error');

        filter.catch(exception, mockHost);

        expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            path: '/test-url',
            message: 'Internal server error',
            error: 'Error'
        }));
    });
});
